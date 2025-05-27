import { Stock } from '../models/stock.model';
import { redisClient } from '../config/redis';

const CACHE_TTL = 3600; // 1 hour

const StockService = {
  async getStockBySymbol(symbol: string) {
    const cacheKey = `stock:${symbol}`;
    
    try {
      // Check cache first
      const cachedStock = await redisClient.get(cacheKey);
      if (cachedStock) return JSON.parse(cachedStock);

      // Get from database
      const stock = await Stock.findOne({ symbol }).lean();
      if (!stock) throw new Error('Stock not found');

      // Cache the result
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(stock));
      
      return stock;
    } catch (error) {
      console.error(`Error fetching stock ${symbol}:`, error);
      throw error;
    }
  },

  async searchStocks(query: string) {
    try {
      return await Stock.find({
        $or: [
          { symbol: new RegExp(query, 'i') },
          { name: new RegExp(query, 'i') }
        ],
        isActive: true
      })
      .sort({ symbol: 1 })
      .limit(20)
      .lean();
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  },

  async updateStockPrices(symbol: string, updateData: any) {
    try {
      const updatedStock = await Stock.findOneAndUpdate(
        { symbol },
        { 
          $set: {
            'currentPrice.last': updateData.close,
            'currentPrice.change': updateData.change,
            'currentPrice.percentChange': updateData.percent_change,
            'currentPrice.lastUpdated': new Date(),
            'today.high': updateData.high,
            'today.low': updateData.low,
            'today.volume': updateData.volume,
          },
          $push: {
            priceHistory: {
              date: new Date(),
              open: updateData.open,
              high: updateData.high,
              low: updateData.low,
              close: updateData.close,
              volume: updateData.volume,
            }
          }
        },
        { new: true }
      );

      // Clear cache
      await redisClient.del(`stock:${symbol}`);
      
      return updatedStock;
    } catch (error) {
      console.error(`Error updating stock ${symbol}:`, error);
      throw error;
    }
  }
};

export default StockService;