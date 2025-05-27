import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import stockRoutes from './routes/stock.routes';

// import { connectRedis } from './config/redis';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to Redis
// connectRedis().catch(console.error);

// Routes
app.use('/api/stocks', stockRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});


export default app;