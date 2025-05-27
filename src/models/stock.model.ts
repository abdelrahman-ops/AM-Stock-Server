import mongoose, { Schema, Document } from 'mongoose';

interface IStock extends Document {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
  volume: number;
  high: number;
  low: number;
  exchange: string;
}

const StockSchema = new Schema<IStock>({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  change: { type: Number, required: true },
  percentChange: { type: Number, required: true },
  volume: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  exchange: { type: String, default: 'EGX' }
}, { timestamps: true });

export const Stock = mongoose.model<IStock>('Stocks', StockSchema);



// import pool from '../config/db';
// import { redisClient } from '../config/redis';

// interface Stock {
//     id: number;
//     symbol: string;
//     name: string;
//     exchange: string;
//     sector?: string;
//     industry?: string;
// }

// const cacheKey = (symbol: string) => `stock:${symbol}`;

// const StockModel = {
//     async findBySymbol(symbol: string): Promise<Stock | null> {
//         // Try cache first
//         const cachedStock = await redisClient.get(cacheKey(symbol));
//         if (cachedStock) return JSON.parse(cachedStock);

//         const { rows } = await pool.query(
//         'SELECT * FROM stocks WHERE symbol = $1',
//         [symbol]
//         );

//         if (rows.length) {
//         // Cache for 1 hour
//         await redisClient.setEx(cacheKey(symbol), 3600, JSON.stringify(rows[0]));
//         return rows[0];
//         }

//         return null;
//     },

//     async create(stock: Omit<Stock, 'id'>): Promise<Stock> {
//         const { rows } = await pool.query(
//         'INSERT INTO stocks (symbol, name, exchange, sector, industry) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//         [stock.symbol, stock.name, stock.exchange, stock.sector, stock.industry]
//         );
//         return rows[0];
//     },

//     async search(query: string): Promise<Stock[]> {
//         const { rows } = await pool.query(
//         `SELECT * FROM stocks 
//         WHERE symbol ILIKE $1 OR name ILIKE $1
//         LIMIT 10`,
//         [`%${query}%`]
//         );
//         return rows;
//     },
// };

// export default StockModel;

