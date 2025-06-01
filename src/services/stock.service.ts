import { Stock } from '../models/stock.model';
import { IStock } from 'types';

export const getAllStocks = async (): Promise<IStock[]> => {
    return await Stock.find().sort({ createdAt: -1 });
};

export const getStockBySymbol = async (symbol: string): Promise<IStock | null> => {
    return await Stock.findOne({ symbol: symbol.toUpperCase() });
};

export const createStock = async (data: Partial<IStock>): Promise<IStock> => {
    return await Stock.create(data);
};

export const updateStock = async (symbol: string, updates: Partial<IStock>): Promise<IStock | null> => {
    return await Stock.findOneAndUpdate({ symbol: symbol.toUpperCase() }, updates, { new: true });
};  

export const deleteStock = async (symbol: string): Promise<IStock | null> => {
    return await Stock.findOneAndDelete({ symbol: symbol.toUpperCase() });
};