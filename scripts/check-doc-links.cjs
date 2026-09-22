// Check local Markdown file targets without network access or reading secrets.
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const api = path.resolve(root, '../dentalflow-api')
function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? markdownFiles(full) : entry.name.endsWith('.md') ? [full] : []
  })
}
const repositories = fs.existsSync(api) ? [root, api] : [root]
const failures = []
let count = 0
for (const repo of repositories) {
  const files = ['README.md', 'AGENTS.md', 'CLAUDE.md'].map((f) => path.join(repo, f))
    .filter((f) => fs.existsSync(f)).concat(markdownFiles(path.join(repo, 'docs')))
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    const relative = path.relative(root, file).replaceAll('\\', '/')
    if (/[A-Z]:[\\/](?:Users|Obsidian)[\\/]|(?:^|[\s("'`])\/home\/[^/\s]+\//im.test(content)) {
      failures.push(`${relative}: machine-specific path`)
    }
    const prose = content.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '')
    for (const match of prose.matchAll(/\[[^\]\n]+\]\(([^)\n]+)\)/g)) {
      const target = match[1].replace(/^<|>$/g, '').split(/\s+"/)[0]
      if (/^(?:https?:|mailto:|#|app:)/.test(target)) continue
      const pathname = decodeURIComponent(target.split('#')[0])
      if (!pathname) continue
      count++
      const resolved = path.resolve(path.dirname(file), pathname)
      if (!fs.existsSync(resolved)) failures.push(`${relative}: missing ${target}`)
    }
  }
}
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Checked ${count} local Markdown file links across ${repositories.length} repositories. Fragments and external URLs are not validated.`)
}
