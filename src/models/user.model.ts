// models/User.ts
import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from 'types';

const userSchema = new Schema<IUser>({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: function(this: IUser) { return !this.isDemo; },
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    kycStatus: {
        type: String,
        enum: ['not_started', 'pending', 'verified', 'rejected'],
        default: 'not_started'
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    isDemo: {
        type: Boolean,
        default: false
    }
    }, {
    timestamps: true
});

userSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password') || !this.password) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

userSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>('User', userSchema);