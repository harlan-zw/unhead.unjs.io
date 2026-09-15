import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { expect, it } from 'vitest'
import { externalCheckin } from '../shared/checkin-external'

it('keeps a complete warning baseline after removing the daily workspace', async () => {
  const root = await mkdtemp(join(tmpdir(), 'unhead-checkin-'))
  const workspace = join(root, 'worktree')
  const archive = join(root, 'archive')
  const cli = resolve('node_modules/@harlan-zw/nuxt-checkin/dist/cli/index.mjs')
  try {
    await mkdir(workspace)
    await mkdir(archive)
    const previous = new Date(Date.now() - 86400000).toISOString()
    await writeFile(join(archive, 'state.json'), JSON.stringify({ lastRunAt: previous }))
    const artifact = join(workspace, 'checks.mjs')
    await writeFile(artifact, `export const options = ${JSON.stringify({ ...externalCheckin, required: ['fixture'], credentials: {} })}; export default [{ id: 'fixture', run: () => ({ _tag: 'Warn', reason: 'Fixture warning', evidence: {} }) }];`)
    const result = spawnSync(process.execPath, [cli, '--artifact', artifact, '--save'], {
      cwd: workspace,
      env: { ...process.env, DAILY_CHECKIN_DIR: archive },
      encoding: 'utf8',
    })
    expect(result.status, result.stderr).toBe(1)
    const report = JSON.parse(result.stdout)
    await rm(workspace, { recursive: true })
    const state = JSON.parse(await readFile(join(archive, 'state.json'), 'utf8'))
    expect(state).toMatchObject({ coverage: 'complete', severity: 'warn', lastRunAt: report.observedAt })
    expect(state.lastRunAt).not.toBe(previous)
    const reportName = (await readdir(archive)).find(name => name !== 'state.json' && name.endsWith('.json'))!
    const saved = JSON.parse(await readFile(join(archive, reportName), 'utf8'))
    expect(saved).toMatchObject({ coverage: 'complete', severity: 'warn' })
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
})
