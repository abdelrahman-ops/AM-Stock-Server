import { Schema, model } from 'mongoose';
import { IOrder } from 'types';

const orderSchema = new Schema<IOrder>({
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
    type: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
    },
    status: {
        type: String,
        enum: ['executed', 'pending'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    }
    }, {
    timestamps: { createdAt: 'timestamp', updatedAt: false }
});

export const Order = model<IOrder>('Order', orderSchema);