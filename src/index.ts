import app from './app';
import connectDB from './config/mongo';
import { VercelRequest, VercelResponse } from '@vercel/node';

const PORT = process.env.PORT || 8000;

connectDB().catch(console.error);

// Export as a module with both GET and POST handlers
module.exports = async (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};

// Local development server
if (process.env.VERCEL_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}