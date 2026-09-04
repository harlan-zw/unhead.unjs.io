/// <reference types="@cloudflare/workers-types" />

export interface D1RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  sleep?: (ms: number) => Promise<void>
}

interface ResolvedD1RetryOptions {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  sleep: (ms: number) => Promise<void>
}

const defaultRetryOptions: ResolvedD1RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 1000,
  sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
}

const transientErrorPatterns: RegExp[] = [
  /overloaded/i,
  /queued for activation/i,
  /network connection lost/i,
  /connection reset/i,
  /internal error/i,
  /temporarily unavailable/i,
  /too many requests/i,
]

export function isTransientD1Error(error: unknown): boolean {
  if (!(error instanceof Error))
    return false
  return transientErrorPatterns.some(pattern => pattern.test(error.message))
}

function backoffDelayMs(attempt: number, options: ResolvedD1RetryOptions): number {
  return Math.min(options.baseDelayMs * 2 ** attempt, options.maxDelayMs)
}

async function retryTransient<T>(run: () => Promise<T>, options: ResolvedD1RetryOptions): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await run()
    }
    catch (error) {
      if (attempt >= options.maxRetries || !isTransientD1Error(error))
        throw error
      await options.sleep(backoffDelayMs(attempt, options))
    }
  }
}

export function wrapD1WithRetry<DB extends D1Database>(db: DB, options: D1RetryOptions = {}): DB {
  const config: ResolvedD1RetryOptions = { ...defaultRetryOptions, ...options }
  const rawStatements = new WeakMap<object, D1PreparedStatement>()

  function unwrapStatements(statements: D1PreparedStatement[]): D1PreparedStatement[] {
    return statements.map(statement => rawStatements.get(statement) ?? statement)
  }

  function wrapStatement(statement: D1PreparedStatement): D1PreparedStatement {
    const proxy = new Proxy(Object.create(statement), {
      get(_target, property) {
        switch (property) {
          case 'bind':
            return (...values: unknown[]) => wrapStatement(statement.bind(...values))
          case 'first':
            return (colName?: string) => retryTransient(
              () => colName === undefined ? statement.first() : statement.first(colName),
              config,
            )
          case 'run':
            return () => retryTransient(() => statement.run(), config)
          case 'all':
            return () => retryTransient(() => statement.all(), config)
          case 'raw':
            return (options?: { columnNames: true }) => options
              ? retryTransient(() => statement.raw(options), config)
              : retryTransient(() => statement.raw(), config)
          default:
            return Reflect.get(statement, property, statement)
        }
      },
    })
    rawStatements.set(proxy, statement)
    return proxy
  }

  function wrapSession(session: D1DatabaseSession): D1DatabaseSession {
    return new Proxy(Object.create(session), {
      get(_target, property) {
        switch (property) {
          case 'prepare':
            return (query: string) => wrapStatement(session.prepare(query))
          case 'batch':
            return <T>(statements: D1PreparedStatement[]) => retryTransient(() => session.batch<T>(unwrapStatements(statements)), config)
          default:
            return Reflect.get(session, property, session)
        }
      },
    })
  }

  return new Proxy(Object.create(db), {
    get(_target, property) {
      switch (property) {
        case 'prepare':
          return (query: string) => wrapStatement(db.prepare(query))
        case 'batch':
          return <T>(statements: D1PreparedStatement[]) => retryTransient(() => db.batch<T>(unwrapStatements(statements)), config)
        case 'exec':
          return (query: string) => retryTransient(() => db.exec(query), config)
        case 'withSession':
          return (constraintOrBookmark?: D1SessionBookmark | D1SessionConstraint) => wrapSession(db.withSession(constraintOrBookmark))
        case 'dump':
          return () => retryTransient(() => db.dump(), config)
        default:
          return Reflect.get(db, property, db)
      }
    },
  }) as DB
}
