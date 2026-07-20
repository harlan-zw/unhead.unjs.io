import { z } from 'zod'

export const ToolIdSchema = z.enum(['meta-tag-generator', 'schema-generator', 'og-image-generator', 'capo-analyzer'])
export const FeedbackContextSchema = z.record(
  z.string().max(64),
  z.union([z.string().max(500), z.number().finite(), z.boolean(), z.null()]),
).refine(context => Object.keys(context).length <= 20, 'Too many context fields')

export interface ThumbsFeedbackResponse {
  thumbs: 'up' | 'down'
  stats: {
    up: number
    down: number
  }
}

export const ThumbsFeedbackSchema = z.object({
  thumbs: z.enum(['up', 'down']),
  toolId: ToolIdSchema.optional(),
  context: FeedbackContextSchema.optional(),
})

export const CommentFeedbackSchema = z.object({
  comment: z.string().trim().min(3, 'Must be at least 3 characters').max(2000, 'Must be at most 2000 characters'),
})

export type CommentFeedbackSchemaOutput = z.output<typeof CommentFeedbackSchema>
