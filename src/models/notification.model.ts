import { Schema, model } from 'mongoose';
import { INotification } from 'types';

const notificationSchema = new Schema<INotification>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const Notification = model<INotification>('Notification', notificationSchema);