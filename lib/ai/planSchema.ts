import { z } from 'zod';

// Zod schema for validating the UpskillPlan structure
export const UpskillPlanSchema = z.object({
  summary: z
    .string()
    .min(10, 'Summary must be at least 10 characters')
    .max(500, 'Summary must be less than 500 characters'),

  prioritized_skills: z
    .array(
      z.object({
        skill: z.string().min(2, 'Skill name too short'),
        reason: z.string().min(10, 'Reason must be at least 10 characters'),
        priority: z.number().int().min(1).max(5),
      })
    )
    .length(5, 'Must have exactly 5 prioritized skills'),

  week_plan: z
    .array(
      z.object({
        week: z.number().int().min(1).max(12),
        focus: z.string().min(5, 'Focus must be at least 5 characters'),
        outcome: z.string().min(5, 'Outcome must be at least 5 characters'),
        mini_project: z.string().min(5, 'Mini project must be at least 5 characters'),
        concepts: z.optional(
          z.array(
            z.object({
              name: z.string().min(2, 'Concept name too short'),
              description: z.string().min(5, 'Description must be at least 5 characters'),
              date: z.string().min(3, 'Date must be specified'),
              resources: z.optional(z.array(z.string())),
            })
          )
        ),
        topics: z.optional(
          z.array(
            z.object({
              title: z.string().min(2, 'Topic title too short'),
              details: z.string().min(5, 'Topic details too short'),
              estimated_hours: z.optional(z.number().int().min(0).max(40)),
              resources: z.optional(z.array(z.string())),
            })
          )
        ),
      })
    )
    .length(12, 'Must have exactly 12 weeks'),

  weekly_schedule: z
    .array(
      z.object({
        day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
        slot: z.string().min(3, 'Time slot must be specified'),
        duration_min: z.number().int().min(0).max(180),
        task: z.string().min(5, 'Task description too short'),
      })
    )
    .length(7, 'Must have exactly 7 days'),

  burnout_tips: z
    .array(z.string().min(10, 'Each tip must be at least 10 characters'))
    .min(4, 'Must have at least 4 burnout tips')
    .max(6, 'Must have at most 6 burnout tips'),

  next_actions: z
    .array(
      z.object({
        title: z.string().min(3, 'Title too short'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
      })
    )
    .length(3, 'Must have exactly 3 next actions'),
});

export type UpskillPlan = z.infer<typeof UpskillPlanSchema>;
