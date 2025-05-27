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

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Stock App API</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          a { color: #0070f3; }
        </style>
      </head>
      <body>
        <h1>Welcome to Stock App API</h1>
        <p>Status: <strong>running</strong></p>
        <h2>Available Endpoints:</h2>
        <ul>
          <li><a href="/api/health">/api/health</a> - Health check</li>
          <li><a href="/api/stocks">/api/stocks</a> - Stocks data</li>
        </ul>
        <p>Last updated: ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `);
});

app.get('/api/debug', (req, res) => {
  res.json({
    status: 'working',
    environment: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
});

export default app;