import { Router, Request, Response } from 'express';
import { getAllStocks, getStockBySymbol } from '../controllers/stock.controller';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  await getAllStocks(req, res);
});

router.get('/:symbol', async (req: Request, res: Response) => {
  await getStockBySymbol(req, res);
});

export default router;