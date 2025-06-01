import { Schema, model } from 'mongoose';
import { IWatchlist } from 'types';

const watchlistSchema = new Schema<IWatchlist>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stockId: {
        type: Schema.Types.ObjectId,
        ref: 'Stock',
        required: true
    }
}, {
    timestamps: true,
});

export const Watchlist = model<IWatchlist>('Watchlist', watchlistSchema);