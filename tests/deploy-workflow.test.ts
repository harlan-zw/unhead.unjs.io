import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

interface Workflow {
  concurrency: { group: string }
  jobs: { deploy: { if?: string } }
}

async function loadDeployWorkflow(): Promise<Workflow> {
  const raw = await readFile(resolve(process.cwd(), '.github/workflows/deploy-cloudflare.yml'), 'utf-8')
  return parse(raw) as Workflow
}

function lookup(context: Record<string, unknown>, path: string): unknown {
  let node: unknown = context
  for (const key of path.split('.')) {
    if (node === null || typeof node !== 'object')
      return undefined
    node = (node as Record<string, unknown>)[key]
  }
  return node
}

function tokenize(expression: string): string[] {
  const tokens: string[] = []
  let index = 0
  while (index < expression.length) {
    const char = expression[index]
    if (char === ' ' || char === '\n' || char === '\t') {
      index += 1
    }
    else if (char === '(' || char === ')') {
      tokens.push(char)
      index += 1
    }
    else if (expression.startsWith('==', index)) {
      tokens.push('==')
      index += 2
    }
    else if (expression.startsWith('!=', index)) {
      tokens.push('!=')
      index += 2
    }
    else if (expression.startsWith('&&', index)) {
      tokens.push('&&')
      index += 2
    }
    else if (expression.startsWith('||', index)) {
      tokens.push('||')
      index += 2
    }
    else if (char === '\'') {
      const end = expression.indexOf('\'', index + 1)
      tokens.push(expression.slice(index + 1, end))
      index = end + 1
    }
    else {
      const word = expression.slice(index).match(/^[\w.]+/)?.[0] ?? ''
      tokens.push(word)
      index += word.length || 1
    }
  }
  return tokens
}

// Minimal evaluator for the GitHub Actions boolean expression forms used in the
// workflow: `&&`, `||`, `==`, `!=`, parentheses, single-quoted literals, and
// `github.*` context paths. Comparison uses loose truthiness so a missing
// context value is falsy, which is how GitHub treats an unset context.
function evaluateExpression(expression: string, context: Record<string, unknown>): unknown {
  const tokens = tokenize(expression)
  let index = 0

  function parseTerm(): unknown {
    const token = tokens[index] ?? ''
    index += 1
    return token.startsWith('github.') ? lookup(context, token) : token
  }

  function parseComparison(): unknown {
    if (tokens[index] === '(') {
      index += 1
      const value = parseOr()
      index += 1
      return value
    }
    const left = parseTerm()
    if (tokens[index] === '==' || tokens[index] === '!=') {
      const operator = tokens[index]
      index += 1
      const right = parseTerm()
      return operator === '==' ? left === right : left !== right
    }
    return left
  }

  function parseAnd(): unknown {
    let value = parseComparison()
    while (tokens[index] === '&&') {
      index += 1
      const right = parseComparison()
      value = value && right
    }
    return value
  }

  function parseOr(): unknown {
    let value = parseAnd()
    while (tokens[index] === '||') {
      index += 1
      const right = parseAnd()
      value = value || right
    }
    return value
  }

  return parseOr()
}

function deployJobRuns(workflow: Workflow, event: Record<string, unknown>): boolean {
  return Boolean(evaluateExpression(workflow.jobs.deploy.if ?? '', event))
}

function resolveConcurrencyGroup(workflow: Workflow, event: Record<string, unknown>): string {
  const template = workflow.concurrency.group
  const open = template.indexOf('{{')
  const close = template.indexOf('}}')
  if (open === -1 || close === -1)
    return template
  const expression = template.slice(open + 2, close).trim()
  return `deploy-cloudflare-${evaluateExpression(expression, event)}`
}

const workflowRunOnMain = {
  github: {
    event_name: 'workflow_run',
    ref_name: 'main',
    event: { workflow_run: { conclusion: 'success', head_branch: 'main' } },
  },
}

describe('deploy-cloudflare.yml job gate', () => {
  it('runs for a successful CI run on main', async () => {
    const workflow = await loadDeployWorkflow()
    expect(deployJobRuns(workflow, workflowRunOnMain)).toBe(true)
  })

  it('skips a successful CI run on a feature branch', async () => {
    const workflow = await loadDeployWorkflow()
    const featureRun = {
      github: {
        event_name: 'workflow_run',
        ref_name: 'main',
        event: { workflow_run: { conclusion: 'success', head_branch: 'feature/x' } },
      },
    }
    expect(deployJobRuns(workflow, featureRun)).toBe(false)
  })

  it('skips a failed CI run on main', async () => {
    const workflow = await loadDeployWorkflow()
    const failedRun = {
      github: {
        event_name: 'workflow_run',
        ref_name: 'main',
        event: { workflow_run: { conclusion: 'failure', head_branch: 'main' } },
      },
    }
    expect(deployJobRuns(workflow, failedRun)).toBe(false)
  })

  it('runs for a manual dispatch on main', async () => {
    const workflow = await loadDeployWorkflow()
    const dispatch = { github: { event_name: 'workflow_dispatch', ref_name: 'main' } }
    expect(deployJobRuns(workflow, dispatch)).toBe(true)
  })

  it('skips a manual dispatch on a feature branch so it cannot reach the Pages production branch', async () => {
    const workflow = await loadDeployWorkflow()
    const dispatch = { github: { event_name: 'workflow_dispatch', ref_name: 'feature/x' } }
    expect(deployJobRuns(workflow, dispatch)).toBe(false)
  })

  it('runs for a repository dispatch on the default branch', async () => {
    const workflow = await loadDeployWorkflow()
    const dispatch = { github: { event_name: 'repository_dispatch', ref_name: 'main' } }
    expect(deployJobRuns(workflow, dispatch)).toBe(true)
  })
})

describe('deploy-cloudflare.yml concurrency group', () => {
  it('serializes every path that writes to the production branch', async () => {
    const workflow = await loadDeployWorkflow()
    const manualDispatch = { github: { event_name: 'workflow_dispatch', ref_name: 'main' } }
    const repositoryDispatch = { github: { event_name: 'repository_dispatch', ref_name: 'main' } }
    const groups = [
      resolveConcurrencyGroup(workflow, workflowRunOnMain),
      resolveConcurrencyGroup(workflow, manualDispatch),
      resolveConcurrencyGroup(workflow, repositoryDispatch),
    ]
    expect(new Set(groups).size).toBe(1)
  })
})
