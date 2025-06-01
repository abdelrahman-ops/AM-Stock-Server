// controllers/stock.controller.ts
import { Request, Response } from 'express';
import { Stock } from '../models/stock.model';
import { IStock } from 'types';

/**
 * @desc    Get all stocks
 * @route   GET /api/stocks
 * @access  Public
 */
export const getStocks = async (req: Request, res: Response): Promise<void> => {
    try {
        const { symbol, exchange, sector, sortBy, limit } = req.query;
        
        // Build query object
        const query: any = {};
        if (symbol) query.symbol = { $regex: symbol as string, $options: 'i' };
        if (exchange) query.exchange = exchange as string;
        if (sector) query.sector = sector as string;

        // Build sort object
        const sortOptions: any = {};
        if (sortBy === 'price') sortOptions.price = -1;
        if (sortBy === 'volume') sortOptions.volume = -1;
        if (sortBy === 'change') sortOptions.change = -1;

        const stocks = await Stock.find(query)
            .sort(sortOptions)
            .limit(Number(limit) || 100);

        res.status(200).json({
            success: true,
            count: stocks.length,
            data: stocks
        });
    } catch (error) {
        console.error('[Stock Controller] Get all error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stocks'
        });
    }
};

/**
 * @desc    Get single stock by symbol
 * @route   GET /api/stocks/:symbol
 * @access  Public
 */
export const getStockBySymbol = async (req: Request, res: Response): Promise<void> => {
    try {
        const stock = await Stock.findOne({ 
            symbol: req.params.symbol.toUpperCase() 
        });

        if (!stock) {
            res.status(404).json({
                success: false,
                message: 'Stock not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: stock
        });
    } catch (error) {
        console.error('[Stock Controller] Get by symbol error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stock'
        });
    }
};

/**
 * @desc    Create new stock (Admin only)
 * @route   POST /api/stocks
 * @access  Private/Admin
 */
export const createStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const { symbol, name, exchange, sector, price, change, volume } = req.body;

        // Validate required fields
        if (!symbol || !name || !exchange) {
            res.status(400).json({
                success: false,
                message: 'Symbol, name and exchange are required'
            });
            return;
        }

        // Check if stock exists
        const existingStock = await Stock.findOne({ symbol: symbol.toUpperCase() });
        if (existingStock) {
            res.status(400).json({
                success: false,
                message: 'Stock with this symbol already exists'
            });
            return;
        }

        // Create new stock
        const stock = await Stock.create({
            symbol: symbol.toUpperCase(),
            name,
            exchange,
            sector,
            price: price || 0,
            change: change || 0,
            volume: volume || 0
        });

        res.status(201).json({
            success: true,
            data: stock
        });
    } catch (error) {
        console.error('[Stock Controller] Create error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create stock'
        });
    }
};

/**
 * @desc    Update stock (Admin only)
 * @route   PUT /api/stocks/:symbol
 * @access  Private/Admin
 */
export const updateStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, exchange, sector, price, change, volume } = req.body;

        const stock = await Stock.findOneAndUpdate(
            { symbol: req.params.symbol.toUpperCase() },
            {
                $set: {
                    name,
                    exchange,
                    sector,
                    price,
                    change,
                    volume
                }
            },
            { new: true, runValidators: true }
        );

        if (!stock) {
            res.status(404).json({
                success: false,
                message: 'Stock not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: stock
        });
    } catch (error) {
        console.error('[Stock Controller] Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update stock'
        });
    }
};

/**
 * @desc    Delete stock (Admin only)
 * @route   DELETE /api/stocks/:symbol
 * @access  Private/Admin
 */
export const deleteStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const stock = await Stock.findOneAndDelete({ 
            symbol: req.params.symbol.toUpperCase() 
        });

        if (!stock) {
            res.status(404).json({
                success: false,
                message: 'Stock not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('[Stock Controller] Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete stock'
        });
    }
};

/**
 * @desc    Update stock prices in bulk (Admin only)
 * @route   PATCH /api/stocks/prices
 * @access  Private/Admin
 */
export const updateStockPrices = async (req: Request, res: Response): Promise<void> => {
    try {
        const { updates } = req.body;

        if (!updates || !Array.isArray(updates)) {
            res.status(400).json({
                success: false,
                message: 'Array of stock updates required'
            });
            return;
        }

        const bulkOps = updates.map((update: any) => ({
            updateOne: {
                filter: { symbol: update.symbol.toUpperCase() },
                update: {
                    $set: {
                        price: update.price,
                        change: update.change || 0,
                        volume: update.volume || 0
                    }
                }
            }
        }));

        const result = await Stock.bulkWrite(bulkOps);

        res.status(200).json({
            success: true,
            data: {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('[Stock Controller] Bulk update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update stock prices'
        });
    }
};