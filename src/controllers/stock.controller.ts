import { Request, Response } from 'express';
import { Stock } from '../models/stock.model';

export const getAllStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await Stock.find().sort({ symbol: 1 });
    console.log(stocks);
    
    if (!stocks || stocks.length === 0) {
      res.status(404).json({ message: 'No stocks found in database' });
      return;
    }
    
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ message: 'Server error while fetching stocks' });
  }
};

export const getStockBySymbol = async (req: Request, res: Response): Promise<void> => {
  try {
    const stock = await Stock.findOne({ symbol: req.params.symbol });
    
    if (!stock) {
      res.status(404).json({ 
        message: `Stock with symbol ${req.params.symbol} not found` 
      });
      return;
    }
    
    res.status(200).json(stock);
  } catch (error) {
    console.error(`Error fetching stock ${req.params.symbol}:`, error);
    res.status(500).json({ 
      message: `Server error while fetching stock ${req.params.symbol}` 
    });
  }
};