import { Schema, model } from 'mongoose';
import { IStock } from 'types';

const stockSchema = new Schema<IStock>({
    symbol: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true
    },
    exchange: {
        type: String,
        required: true
    },
    sector: String,
    price: Number,
    change: {
        type: Number,
        default: 0
    },
    volume: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export const Stock = model<IStock>('Stock', stockSchema);