import { Request, Response } from 'express';
import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';
import { IUser } from 'types';

/**
 * @desc    Create new admin user (superadmin only)
 * @route   POST /api/users/admin
 * @access  Private/superadmin
 */
export const createAdminUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password, kycStatus = 'verified', balance = 0 } = req.body;
    console.log('[ADMIN CREATE] called by:', req.user);
    try {
        // Validate input
        if (!email || !password) {
            res.status(400).json({ 
                success: false,
                message: 'Email and password are required',
                field: !email ? 'email' : 'password'
            });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
            return;
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(409).json({ 
                success: false,
                message: 'Email already registered'
            });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user
        const adminUser = await User.create({
            email,
            password: hashedPassword,
            role: 'admin',
            kycStatus,
            isDemo: false,
            balance,
            createdBy: req.user?.id
        });

        res.status(201).json({
            success: true,
            data: {
                id: adminUser.id,
                email: adminUser.email,
                role: adminUser.role,
                createdAt: adminUser.createdAt,
                createdBy: {
                    id: req.user?.id,
                    email: req.user?.email
                }
            }
        });

        console.log(`[ADMIN CREATION] Superadmin ${req.user?.email} created new admin ${email}`);

    } catch (error: any) {
        console.error('[Admin Controller] Creation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Admin creation failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get all users (Admin+ only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        // Superadmins can see all users, admins can see non-admin users
        const filter = req.user?.role === 'superadmin' ? {} : { role: { $ne: 'admin' } };
        
        const users = await User.find(filter).select('-password -__v');
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error: any) {
        console.error('[Admin Controller] Get users error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.id;
        const requestingUser = req.user;

        // Prevent self-deletion
        if (requestingUser?.id.toString() === userId) {
            res.status(400).json({ 
                success: false,
                message: 'Cannot delete your own account' 
            });
            return;
        }

        // Find the user to be deleted
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
            return;
        }

        // Admins can't delete other admins or superadmins
        if (requestingUser?.role === 'admin' && 
            (userToDelete.role === 'admin' || userToDelete.role === 'superadmin')) {
            res.status(403).json({ 
                success: false,
                message: 'Not authorized to delete this user' 
            });
            return;
        }

        // Superadmins can't delete other superadmins
        if (userToDelete.role === 'superadmin' && requestingUser?.role === 'superadmin') {
            res.status(403).json({ 
                success: false,
                message: 'Cannot delete other superadmins' 
            });
            return;
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({ 
            success: true,
            message: 'User deleted successfully' 
        });

        console.log(`[USER DELETION] ${requestingUser?.email} deleted user ${userToDelete.email}`);

    } catch (error: any) {
        console.error('[Admin Controller] Delete user error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get user by ID (Admin+ only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.id;
        const requestingUser = req.user;

        const user = await User.findById(userId).select('-password -__v');

        if (!user) {
            res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
            return;
        }

        // Admins can't view other admin/superadmin profiles
        if (requestingUser?.role === 'admin' && 
            (user.role === 'admin' || user.role === 'superadmin')) {
            res.status(403).json({ 
                success: false,
                message: 'Not authorized to view this user' 
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error: any) {
        console.error('[Admin Controller] Get user by ID error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Update user (Admin+ only)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.id;
        const requestingUser = req.user;
        const updates = req.body;

        // Prevent self-role change
        if (updates.role && requestingUser?.id.toString() === userId) {
            res.status(400).json({ 
                success: false,
                message: 'Cannot change your own role' 
            });
            return;
        }

        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
            return;
        }

        // Admins can't update other admins/superadmins
        if (requestingUser?.role === 'admin' && 
            (userToUpdate.role === 'admin' || userToUpdate.role === 'superadmin')) {
            res.status(403).json({ 
                success: false,
                message: 'Not authorized to update this user' 
            });
            return;
        }

        // Superadmins can't change other superadmins' roles
        if (updates.role && userToUpdate.role === 'superadmin' && requestingUser?.role === 'superadmin') {
            res.status(403).json({ 
                success: false,
                message: 'Cannot change superadmin roles' 
            });
            return;
        }

        // Prevent role escalation
        if (updates.role === 'superadmin' && requestingUser?.role !== 'superadmin') {
            res.status(403).json({ 
                success: false,
                message: 'Not authorized to assign superadmin role' 
            });
            return;
        }

        // Update fields
        userToUpdate.email = updates.email || userToUpdate.email;
        if (updates.role && requestingUser?.role === 'superadmin') {
            userToUpdate.role = updates.role;
        }
        userToUpdate.kycStatus = updates.kycStatus || userToUpdate.kycStatus;
        userToUpdate.balance = updates.balance ?? userToUpdate.balance;
        userToUpdate.isDemo = updates.isDemo ?? userToUpdate.isDemo;

        // Handle password update if provided
        if (updates.password) {
            if (updates.password.length < 8) {
                res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters'
                });
                return;
            }
            const salt = await bcrypt.genSalt(10);
            userToUpdate.password = await bcrypt.hash(updates.password, salt);
        }

        const updatedUser = await userToUpdate.save();

        res.status(200).json({
            success: true,
            data: {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
                kycStatus: updatedUser.kycStatus,
                balance: updatedUser.balance,
                isDemo: updatedUser.isDemo,
                updatedAt: updatedUser.updatedAt
            }
        });

        console.log(`[USER UPDATE] ${requestingUser?.email} updated user ${userToUpdate.email}`);

    } catch (error: any) {
        console.error('[Admin Controller] Update user error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};