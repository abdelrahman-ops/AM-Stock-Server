import { Schema, model } from 'mongoose';
import { IKYC } from 'types';

const kycSchema = new Schema<IKYC>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    nationalId: {
        type: String,
        required: true
    },
    selfieUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

export const KYC = model<IKYC>('KYC', kycSchema);