import { Router } from 'express';
import { z } from 'zod';
import { validateBody, validateParams } from '../middleware/validation.ts';
import { authenticateToken } from '../middleware/auth.ts';

const createHabitSchema = z.object({
  name: z.string(),
});
const completeParamsSchema = z.object({
  id: z.string(),
});

const router = Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  res.status(200).json({ message: 'all habits ' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ message: 'one habit ' });
});

router.post('/', validateBody(createHabitSchema), (req, res) => {
  res.status(201).json({ message: 'habit created ' });
});

router.put('/:id', (req, res) => {
  res.status(200).json({ message: 'habit updated ' });
});

router.delete('/:id', (req, res) => {
  res.status(204).json({ message: 'habit deleted ' });
});

router.post('/:id/complete', validateParams(completeParamsSchema), validateBody(createHabitSchema), (req, res) => {
  res.status(201).json({ message: 'habit completed ' });
})

export default router;
