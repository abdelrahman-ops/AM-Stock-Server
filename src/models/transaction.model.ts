import { Schema, model } from 'mongoose';
import { ITransaction } from 'types';

const transactionSchema = new Schema<ITransaction>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['deposit', 'withdraw', 'buy', 'sell'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['executed', 'pending'],
        default: 'pending'
    }
    }, {
    timestamps: { createdAt: 'timestamp', updatedAt: false }
});

export const Transaction = model<ITransaction>('Transaction', transactionSchema);