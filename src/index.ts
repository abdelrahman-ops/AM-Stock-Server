import { VercelRequest, VercelResponse } from '@vercel/node';
import app from './app';
import connectDB from './config/mongo';

// Initialize DB connection
connectDB().catch(console.error);

// Export as serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  // Enable CORS for all routes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  
  return app(req, res);
};

// Local development server
if (process.env.NODE_ENV === 'development') {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Local server running on http://localhost:${PORT}`);
  });
}