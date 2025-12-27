import { Router } from 'express';
import { login, register } from '../controllers/authController.ts';
import { validateBody } from '../middleware/validation.ts';
import { insertUserSchema, selectUserSchema } from '../db/schema.ts';
import z from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

const router = Router();

router.post('/register',validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

export default router;
