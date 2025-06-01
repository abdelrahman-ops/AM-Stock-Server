// middleware/authMiddleware.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { IUser } from 'types';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader?.startsWith('Bearer') ? authHeader.split(' ')[1] : null;
        const token = req.cookies?.token || tokenFromHeader;

        if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized - No token provided' });
        return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('[Auth Middleware] Token error:', err);
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

// Role-based middleware
export const role = (...allowedRoles: string[]): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        console.log('[MIDDLEWARE] req.user:', req.user?.email, req.user?.role);
        if (!req.user) {
            res.status(401).json({ 
                success: false, 
                message: "Not authenticated" 
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ 
                success: false, 
                message: `Forbidden - Requires role: ${allowedRoles.join(', ')}`,
            });
            return;
        }
        next();
    };
};

// Specific role middlewares for convenience
export const admin: RequestHandler = role('admin', 'superadmin');
export const superadmin: RequestHandler = role('superadmin');