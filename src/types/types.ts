// types.ts
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
    firstname: string;
    lastname: string;
    email: string;
    password?: string;
    role: 'user' | 'admin' | 'superadmin';
    kycStatus: 'not_started' | 'pending' | 'verified' | 'rejected';
    balance: number;
    isDemo: boolean;
    comparePassword?(candidatePassword: string): Promise<boolean>;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IStock extends Document {
    symbol: string;
    name: string;
    exchange: string;
    sector?: string;
    price?: number;
    change: number;
    volume: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserStock extends Document {
    userId: Types.ObjectId | IUser;
    stockId: Types.ObjectId | IStock;
    quantity: number;
    avgPrice: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ITransaction extends Document {
    userId: Types.ObjectId | IUser;
    type: 'deposit' | 'withdraw' | 'buy' | 'sell';
    amount: number;
    status: 'executed' | 'pending';
    timestamp?: Date;
}

export interface IOrder extends Document {
    userId: Types.ObjectId | IUser;
    stockId: Types.ObjectId | IStock;
    type: 'buy' | 'sell';
    status: 'executed' | 'pending';
    amount: number;
    timestamp?: Date;
}

export interface IWatchlist extends Document {
    userId: Types.ObjectId | IUser;
    stockId: Types.ObjectId | IStock;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IKYC extends Document {
    userId: Types.ObjectId | IUser;
    nationalId: string;
    selfieUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface INotification extends Document {
    userId: Types.ObjectId | IUser;
    message: string;
    read: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}