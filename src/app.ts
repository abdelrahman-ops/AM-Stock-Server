import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import stockRoutes from './routes/stock.routes';

// import { connectRedis } from './config/redis';

dotenv.config();

const app = express();

// Middleware
app.use(
    cors({ 
        origin: [
            "http://localhost:5173" , 
            "https://am-stock-app.vercel.app",
            "https://am-stock-server.vercel.app"
        ], 
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);
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


app.get('/api/debug', (req, res) => {
  res.json({
    status: 'working',
    environment: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('hi');
});

export default app;