import { Router } from 'express'
import {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  // logHabitCompletion,
  // completeHabit,
  // getHabitsByTag,
  // addTagsToHabit,
  // removeTagFromHabit,
} from '../controllers/habitController.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { validateBody, validateParams } from '../middleware/validation.ts'
import { z } from 'zod'

const router = Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Validation schemas
const createHabitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    message: 'Frequency must be daily, weekly, or monthly',
  }),
  targetCount: z.number(),
  tagIds: z.array(z.uuid()).optional(),
})

const updateHabitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  targetCount: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  tagIds: z.array(z.uuid()).optional(),
})

const uuidSchema = z.object({
  id: z.string().uuid('Invalid habit ID format'),
})

// CRUD Routes
router.get('/', getHabits)
router.get('/:id', validateParams(uuidSchema), getHabitById)
router.post('/', validateBody(createHabitSchema), createHabit)
router.put(
  '/:id',
  validateParams(uuidSchema),
  validateBody(updateHabitSchema),
  updateHabit
)
router.delete('/:id', validateParams(uuidSchema), deleteHabit)

// Additional habit-specific routes
router.post(
  '/:id/complete',
  validateParams(uuidSchema),
  validateBody(z.object({ note: z.string().optional() })),
  // completeHabit
)

// Tag relationship routes
router.get('/tag/:tagId',
  validateParams(z.object({ tagId: z.uuid() })),
  // getHabitsByTag
)
router.post(
  '/:id/tags',
  validateParams(uuidSchema),
  validateBody(z.object({ tagIds: z.array(z.uuid()).min(1) })),
  // addTagsToHabit
)

export default router
