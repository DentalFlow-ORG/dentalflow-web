const fs = require('node:fs')
const path = require('node:path')

// Read Vitest's existing JSON report without changing its coverage denominator.
const input = process.argv[2] || 'coverage/coverage-final.json'
const coverage = JSON.parse(fs.readFileSync(input, 'utf8'))

function metric(hits) {
  const total = hits.length
  const covered = hits.filter((count) => count > 0).length
  return { total, covered, skipped: 0, pct: total ? Math.floor(covered / total * 10000) / 100 : 100 }
}

function ranges(lines) {
  const groups = []
  for (const line of [...new Set(lines)].sort((a, b) => a - b)) {
    const last = groups.at(-1)
    if (last && last[1] + 1 === line) last[1] = line
    else groups.push([line, line])
  }
  return groups.map(([start, end]) => (start === end ? `${start}` : `${start}-${end}`)).join(', ')
}

const files = Object.entries(coverage).map(([file, data]) => {
  const lines = {}
  for (const [id, hits] of Object.entries(data.s)) {
    const line = data.statementMap[id].start.line
    lines[line] = Math.max(lines[line] || 0, hits)
  }
  const summary = {
    statements: metric(Object.values(data.s)),
    branches: metric(Object.values(data.b).flat()),
    functions: metric(Object.values(data.f)),
    lines: metric(Object.values(lines)),
  }
  const branches = Object.entries(data.b).flatMap(([id, hits]) =>
    hits.flatMap((count, index) => {
      if (count !== 0) return []
      const branch = data.branchMap[id]
      const armLocation = branch.locations[index]
      // V8 may omit a source span for an implicit else. Keep the arm identity
      // and report its parent condition instead of silently losing its line.
      const hasArmLocation = armLocation?.start?.line != null
      const location = hasArmLocation ? armLocation : branch.loc
      return [{ id, line: location.start.line, column: location.start.column, type: branch.type, arm: index, location: hasArmLocation ? 'arm' : 'condition' }]
    }),
  )
  return {
    file: path.relative(process.cwd(), file).split(path.sep).join('/'),
    summary,
    uncoveredLines: ranges(Object.keys(lines).filter((line) => lines[line] === 0).map(Number)),
    uncoveredBranches: branches,
    uncoveredFunctions: Object.entries(data.f).flatMap(([id, hits]) =>
      hits === 0 ? [{ name: data.fnMap[id].name, line: data.fnMap[id].loc.start.line }] : [],
    ),
  }
}).sort((a, b) => b.uncoveredBranches.length - a.uncoveredBranches.length || a.summary.lines.pct - b.summary.lines.pct)

const total = {}
for (const key of ['statements', 'branches', 'functions', 'lines']) {
  const count = files.reduce((sum, file) => sum + file.summary[key].total, 0)
  const covered = files.reduce((sum, file) => sum + file.summary[key].covered, 0)
  total[key] = { total: count, covered, skipped: 0, pct: count ? Math.floor(covered / count * 10000) / 100 : 100 }
}
process.stdout.write(`${JSON.stringify({ total, files }, null, 2)}\n`)
