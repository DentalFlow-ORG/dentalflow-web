const fs = require('node:fs')
const path = require('node:path')

const root = process.cwd()
const srcRoot = path.join(root, 'src')
const publicRoot = path.join(root, 'public')
const sourceExtensions = new Set(['.ts', '.tsx'])
const entrypoints = ['src\\main.tsx']

function walk(dir, predicate) {
  if (!fs.existsSync(dir)) return []

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(fullPath, predicate)
    return predicate(fullPath) ? [fullPath] : []
  })
}

function toRepoPath(filePath) {
  return path.relative(root, filePath).split(path.sep).join('\\')
}

function resolveLocalImport(fromFile, specifier) {
  let basePath

  if (specifier.startsWith('@/')) {
    basePath = path.join(srcRoot, specifier.slice(2))
  } else if (specifier.startsWith('.')) {
    basePath = path.resolve(path.dirname(fromFile), specifier)
  } else {
    return null
  }

  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
  ]

  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
}

function findReachableSourceFiles(files) {
  const dependencies = new Map()
  const importPattern =
    /(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8')
    const imports = []

    for (const match of text.matchAll(importPattern)) {
      const resolved = resolveLocalImport(file, match[1] || match[2])
      if (resolved && sourceExtensions.has(path.extname(resolved))) {
        imports.push(toRepoPath(resolved))
      }
    }

    dependencies.set(toRepoPath(file), imports)
  }

  const reachable = new Set(entrypoints)
  const queue = [...entrypoints]

  while (queue.length > 0) {
    const current = queue.shift()
    for (const dependency of dependencies.get(current) ?? []) {
      if (!reachable.has(dependency)) {
        reachable.add(dependency)
        queue.push(dependency)
      }
    }
  }

  return reachable
}

function findUnusedPublicAssets() {
  const publicFiles = walk(publicRoot, (file) => fs.statSync(file).isFile())
  if (publicFiles.length === 0) return []

  const searchableFiles = [
    ...walk(srcRoot, (file) => fs.statSync(file).isFile()),
    path.join(root, 'index.html'),
    path.join(root, 'README.md'),
  ].filter((file) => fs.existsSync(file))

  const searchableText = searchableFiles
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n')

  return publicFiles
    .map((file) => {
      const repoPath = toRepoPath(file)
      const publicPath = `/${path.relative(publicRoot, file).split(path.sep).join('/')}`
      return { repoPath, publicPath }
    })
    .filter(({ publicPath }) => !searchableText.includes(publicPath))
    .map(({ repoPath }) => repoPath)
}

const testDirs = new Set([
  path.join(srcRoot, 'tests'),
  path.join(srcRoot, 'test-utils'),
])

function isTestFile(file) {
  if (file.endsWith('.test.ts') || file.endsWith('.test.tsx') || file.endsWith('.spec.ts') || file.endsWith('.spec.tsx')) return true
  for (const dir of testDirs) {
    if (file.startsWith(dir + path.sep) || file.startsWith(dir + '/')) return true
  }
  return false
}

const ignoreFile = path.join(root, '.unused-files-ignore')
const ignoredUnused = fs.existsSync(ignoreFile)
  ? fs.readFileSync(ignoreFile, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
  : []
const ignoredUnusedSet = new Set(ignoredUnused)

const sourceFiles = walk(srcRoot, (file) => sourceExtensions.has(path.extname(file)) && !isTestFile(file))
const reachable = findReachableSourceFiles(sourceFiles)
const unusedSourceFiles = sourceFiles
  .map(toRepoPath)
  .filter((file) => !reachable.has(file) && !ignoredUnusedSet.has(file))
const unusedPublicAssets = findUnusedPublicAssets()
const unusedFiles = [...unusedSourceFiles, ...unusedPublicAssets].sort()

if (unusedFiles.length > 0) {
  console.error('Unused files found:')
  for (const file of unusedFiles) {
    console.error(`- ${file}`)
  }
  process.exit(1)
}

console.log('No unused files found.')
