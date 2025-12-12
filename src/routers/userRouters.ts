import { Router } from 'express';

const router = Router();


router.get('/', (req, res) => {
  res.status(200).json({ message: 'all users' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ message: 'one user' });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'user created' });
});

router.put('/:id', (req, res) => {
  res.status(200).json({ message: 'user updated' });
});

router.delete('/:id', (req, res) => {
  res.status(204).json({ message: 'user deleted' });
});

export default router;
