import express from 'express';
import authRoutes from './routers/authRoutes.ts';
import userRoutes from './routers/userRouters.ts';
import habitRoutes from './routers/habitRoutes.ts';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { isTest } from '../env.ts';
import { errorHandler } from './middleware/errorHandlers.ts';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(morgan('dev', {
  skip: () => isTest(),
}));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Habit Tracker API',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);

app.use(errorHandler);

export { app };

export default app;
