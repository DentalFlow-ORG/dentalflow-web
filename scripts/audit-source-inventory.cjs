// Read-only source inventory. Run from dentalflow-web; no server or DB access.
// Output is evidence for review, not an OpenAPI contract or proof of runtime behavior.
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const web = path.resolve(__dirname, '..')
const api = path.resolve(web, process.argv[2] || '../dentalflow-api')
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? files(full) : [full]
  })
}
const rel = (file) => path.relative(web, file).replaceAll('\\', '/')
const parse = (file) => ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
const decorators = (node) => (ts.canHaveDecorators(node) ? ts.getDecorators(node) || [] : [])
  .map((d) => d.expression).filter(ts.isCallExpression)
const named = (node, name) => decorators(node).find((d) => d.expression.getText() === name)
const values = (call) => call ? call.arguments.flatMap((arg) => ts.isArrayLiteralExpression(arg) ? arg.elements.map((e) => e.text) : [arg.text ?? arg.getText()]) : []
const routes = []
const backendConfig = ts.readConfigFile(path.join(api, 'tsconfig.json'), ts.sys.readFile)
const parsedConfig = ts.parseJsonConfigFileContent(backendConfig.config, ts.sys, api)
const program = ts.createProgram(parsedConfig.fileNames, { ...parsedConfig.options, noEmit: true })
const checker = program.getTypeChecker()
for (const file of files(path.join(api, 'src')).filter((f) => f.endsWith('.controller.ts'))) {
  const source = program.getSourceFile(file) || parse(file)
  for (const cls of source.statements.filter(ts.isClassDeclaration)) {
    const prefix = values(named(cls, 'Controller'))[0] || ''
    for (const member of cls.members.filter(ts.isMethodDeclaration)) {
      const verb = decorators(member).find((d) => ['Get', 'Post', 'Put', 'Patch', 'Delete'].includes(d.expression.getText()))
      if (!verb) continue
      const policy = ['Public', 'AnyAuthenticated', 'Roles'].map((name) => named(member, name)).find(Boolean)
        || ['Public', 'AnyAuthenticated', 'Roles'].map((name) => named(cls, name)).find(Boolean)
      const flags = ['TenantScoped', 'RequiresBillingAccess', 'RequirePlanFeature'].flatMap((name) => {
        const d = named(member, name) || named(cls, name)
        return d ? [d.getText()] : []
      })
      const inputs = member.parameters.filter((p) => ['Body', 'Query', 'Param'].some((name) => named(p, name)))
        .map((p) => p.getText().replace(/\s+/g, ' '))
      for (const suffix of values(verb).length ? values(verb) : ['']) {
        const signature = checker.getSignatureFromDeclaration(member)
        routes.push({ method: verb.expression.getText().toUpperCase(), path: `/${prefix}/${suffix}`.replace(/\/$/, ''), policy: policy?.getText() || 'UNDECLARED', flags, inputs, handler: member.name.getText(), source: rel(file), line: source.getLineAndCharacterOfPosition(member.getStart()).line + 1, status: values(named(member, 'HttpCode'))[0] || (verb.expression.getText() === 'Post' ? '201 (Nest default; explicit response may override)' : '200 (default; explicit response may override)'), response: signature ? checker.typeToString(checker.getReturnTypeOfSignature(signature)) : 'Inspect handler and delegated service' })
      }
    }
  }
}
const clients = []
for (const file of files(path.join(web, 'src/features')).filter((f) => f.includes(`${path.sep}services${path.sep}`) && f.endsWith('.ts'))) {
  const source = parse(file)
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText() === 'apiRequest') {
      const input = node.arguments[0]
      const options = node.arguments[1]
      const method = options && ts.isObjectLiteralExpression(options)
        ? options.properties.find((p) => p.name?.getText() === 'method')?.initializer?.text || 'GET' : 'GET'
      clients.push({ source: rel(file), method, path: input?.getText(), response: node.typeArguments?.[0]?.getText() || 'inferred' })
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
}
const schema = fs.readFileSync(path.join(api, 'prisma/schema.prisma'), 'utf8')
const models = [...schema.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)].map((m) => ({ name: m[1], fields: m[2].trim().split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('//')) }))
const env = new Map()
for (const file of [...files(path.join(api, 'src')), ...files(path.join(web, 'src')), path.join(api, 'prisma.config.ts'), ...files(path.join(api, 'prisma')).filter((f) => f.endsWith('.ts'))].filter((f) => /\.tsx?$/.test(f) && !/\.(test|spec)\./.test(f))) {
  const text = fs.readFileSync(file, 'utf8')
  for (const m of text.matchAll(/(?:process\.env|import\.meta\.env)\.([A-Z][A-Z0-9_]*)/g)) {
    if (!env.has(m[1])) env.set(m[1], new Set())
    env.get(m[1]).add(rel(file))
  }
}
const environment = [...env].sort().map(([name, sources]) => ({ name, sources: [...sources] }))
const escape = (value) => String(value).replaceAll('|', '\\|').replace(/\s+/g, ' ')
const link = (file) => `[${file}](../../${file})`
const normalize = (value) => value.replace(/^['"`]|['"`]$/g, '').replace(/\$\{[^}]+\}/g, ':param').split('?')[0].replace(/\/$/, '')
for (const client of clients) {
  const literalPath = normalize(client.path || '')
  client.candidates = routes.filter((route) => route.method === client.method && route.path.replace(/:[^/]+/g, ':param') === literalPath).map((route) => route.path)
}
const inventory = { routes, clients, models, environment }
if (process.argv.includes('--write')) {
  const out = path.join(web, 'docs/integrations')
  fs.mkdirSync(out, { recursive: true })
  const lines = ['# Source reference', '', 'Generated by `bun scripts/audit-source-inventory.cjs ../dentalflow-api --write`. Review changes with both repositories available. No database or running server is consulted.', '', `Inventory: ${routes.length} controller route declarations (including aliases), ${clients.length} direct feature-service apiRequest calls, ${models.length} Prisma models. This is a source index, not an OpenAPI schema or proof of end-to-end compatibility. Dynamic wrappers, fetch/blob downloads and browser redirects require manual review. Types may be abbreviated by TypeScript; the linked handler, DTO and service remain authoritative.`, '', '## API routes', '', 'Paths use /api by default except /webhooks/whatsapp, which is explicitly excluded from the prefix. PUBLIC overrides class-level guards; tenant and billing behavior must be read with the guard implementation. All non-public routes use Bearer authentication. Request fields and validation are in the DTO sources below; list pagination is endpoint-specific. Error shape and special response behavior are in [API contract](api-contract.md).', '']
  for (const route of routes) {
    lines.push(`### ${route.method} ${route.path}`, '', `- Handler: ${link(route.source)} → \`${route.handler}\` (line ${route.line}).`, `- Policy: \`${escape(route.policy)}\`. Flags: ${route.flags.map((f) => `\`${escape(f)}\``).join(', ') || 'none declared'}.`, `- Inputs: ${route.inputs.map((i) => `\`${escape(i)}\``).join('; ') || 'No Body/Query/Param parameter declared; inspect Req/Res for webhooks/cookies.'}`, `- Success status: ${route.status}. Return type: \`${escape(route.response)}\`.`, '')
  }
  lines.push('## Request DTOs', '', 'These source files are the exact payload/query constraints, including optionality, enums, nested validation and bounds. Do not substitute TypeScript response types for runtime validation.', '')
  for (const file of files(path.join(api, 'src')).filter((f) => f.endsWith('.dto.ts'))) lines.push(`- ${link(rel(file))}`)
  lines.push('', '## Frontend calls', '', '| Client | Method | URL expression | Candidate backend path | Expected response type |', '| --- | --- | --- | --- | --- |')
  for (const client of clients) lines.push(`| ${link(client.source)} | ${client.method} | \`${escape(client.path)}\` | ${client.candidates.join(', ') || 'Manual review: dynamic expression or unmatched'} | \`${escape(client.response)}\` |`)
  lines.push('', '## Endpoints without a direct matched apiRequest call', '', 'Not a dead-code list: public OAuth, webhooks, blob downloads, aliases, infrastructure and dynamic client wrappers are expected here. Remove nothing based on this list alone.', '')
  for (const route of routes.filter((r) => !clients.some((c) => c.method === r.method && c.candidates.includes(r.path)))) lines.push(`- ${route.method} ${route.path} — ${link(route.source)}`)
  fs.writeFileSync(path.join(out, 'source-reference.md'), `${lines.join('\n')}\n`)
  const db = ['# Database source reference', '', 'Generated with the source inventory. Exact field types, foreign-key relations, uniqueness, indexes, timestamps and mapped SQL names from [schema.prisma](../../../dentalflow-api/prisma/schema.prisma). SQL-only constraints must additionally be reviewed in migrations; see [architecture](../architecture/system.md).', '']
  for (const model of models) db.push(`## ${model.name}`, '', '```prisma', `model ${model.name} {`, ...model.fields.map((f) => `  ${f}`), '}', '```', '')
  fs.writeFileSync(path.join(out, 'database-reference.md'), `${db.join('\n')}\n`)
  console.log(`Generated ${routes.length} routes, ${clients.length} calls, ${models.length} models`)
} else {
  process.stdout.write(`${JSON.stringify(inventory, null, 2)}\n`)
}
