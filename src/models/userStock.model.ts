// models/UserStock.ts
import { Schema, model } from 'mongoose';
import { IUserStock } from 'types';

const userStockSchema = new Schema<IUserStock>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stockId: {
        type: Schema.Types.ObjectId,
        ref: 'Stock',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    avgPrice: {
        type: Number,
        required: true,
        min: 0
    }
    }, {
    timestamps: true,
});

export const UserStock = model<IUserStock>('UserStock', userStockSchema);