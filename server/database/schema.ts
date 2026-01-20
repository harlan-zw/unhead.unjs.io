import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  githubId: integer('github_id').unique(),
  githubLogin: text('github_login'),
  githubEmail: text('github_email'),
  githubAvatarUrl: text('github_avatar_url'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const toolLookups = sqliteTable('tool_lookups', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: text('session_id'),
  tool: text('tool', { enum: ['meta-tag-generator', 'schema-generator'] }).notNull(),
  action: text('action', { enum: ['view', 'use', 'copy', 'reset', 'preset'] }).notNull(),
  label: text('label'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, t => [
  index('idx_tool_lookups_tool').on(t.tool),
  index('idx_tool_lookups_created_at').on(t.createdAt),
])

export const feedback = sqliteTable('feedback', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  path: text('path').notNull(),
  thumb: text('thumb', { enum: ['up', 'down'] }),
  comment: text('comment'),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: text('session_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, t => [
  index('idx_feedback_path').on(t.path),
  index('idx_feedback_created_at').on(t.createdAt),
])

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type ToolLookup = typeof toolLookups.$inferSelect
export type NewToolLookup = typeof toolLookups.$inferInsert
export type Feedback = typeof feedback.$inferSelect
export type NewFeedback = typeof feedback.$inferInsert
