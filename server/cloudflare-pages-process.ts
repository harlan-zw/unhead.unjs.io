import nativeProcess from 'node:process'

/** The console methods that receive each line written to the stdio fallbacks. */
export interface ConsoleSink {
  log: (line: string) => void
  error: (line: string) => void
}

/** A minimal writable stream that forwards each written chunk to the console. */
export interface ConsoleStream {
  readonly isTTY: false
  write: (chunk: string | Uint8Array) => boolean
}

export interface ProcessFallbacks {
  stdout: ConsoleStream
  stderr: ConsoleStream
  cwd: () => string
  uptime: () => number
}

/**
 * Adds the Node `process` members that bundled dependencies use without a
 * guard and that workerd's process v1 lacks. A member the runtime already
 * provides stays untouched, so a process v2 runtime keeps its native streams.
 *
 * The Pages project runs a compatibility date before process v2, and the
 * Nitro 3 build injects the native `node:process` as the global `process`.
 * consola reads `process.stdout.columns` and `process.cwd()` when it logs, so
 * without these members every server log throws.
 */
export function withProcessFallbacks<T extends object>(target: T, sink: ConsoleSink): T & ProcessFallbacks {
  const fallbacks: ProcessFallbacks = {
    stdout: createConsoleStream(line => sink.log(line)),
    stderr: createConsoleStream(line => sink.error(line)),
    cwd: () => '/',
    uptime: () => 0,
  }
  const current = target as Partial<Record<keyof ProcessFallbacks, unknown>>
  for (const key of Object.keys(fallbacks) as (keyof ProcessFallbacks)[]) {
    if (current[key] === undefined)
      Object.defineProperty(target, key, { value: fallbacks[key], configurable: true, enumerable: true, writable: true })
  }
  return target as T & ProcessFallbacks
}

function createConsoleStream(writeLine: (line: string) => void): ConsoleStream {
  const decoder = new TextDecoder()
  return {
    isTTY: false,
    write(chunk) {
      const text = typeof chunk === 'string' ? chunk : decoder.decode(chunk)
      writeLine(text.endsWith('\n') ? text.slice(0, -1) : text)
      return true
    },
  }
}

// Nitro injects this module as the global `process` of the Pages Worker build.
export default withProcessFallbacks(nativeProcess, console)
