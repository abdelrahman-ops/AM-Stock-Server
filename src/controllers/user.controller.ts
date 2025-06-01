// controllers/user.controller.ts
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';
import { IUser } from 'types';
import { generateToken } from '../utils/authUtils';

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const {firstname, lastname, email, password, isDemo = false, role = 'user' , kycStatus = 'not_started', balance } = req.body;
    console.log(req.body);
    
    try {
        // Validate input
        if (!email || (!password && !isDemo)) {
            res.status(400).json({ message: 'Please provide all required fields' });
            return;
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Security rules for admin creation
        const creatingAdmin = role === 'admin';
        const isAdminRequest = req.body?.role === 'admin';

        console.log('creatingAdmin:', creatingAdmin);
        console.log('isAdminRequest:', isAdminRequest);
        console.log('req.body?.role:', req.body?.role);

        if (creatingAdmin && !isAdminRequest) {
            res.status(403).json({ message: 'Admin privileges required to create admin accounts' });
            return;
        }

        // Determine balance - demo accounts get 10,000, others get 0 or specified amount (admin only)
        let initialBalance = isDemo ? 10000 : 0;
        if (balance !== undefined && isAdminRequest) {
            initialBalance = balance;
        }

        // Create user
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: isDemo ? undefined : password,
            role: isAdminRequest ? role : 'user',
            kycStatus: isAdminRequest ? kycStatus : 'not_started',
            isDemo,
            balance: initialBalance
        });

        if (user) {
            const token = generateToken(user.id);
            
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.status(201).json({
                id: user.id,
                fisrtname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                kycStatus: user.kycStatus,
                balance: user.balance,
                isDemo: user.isDemo,
                token
            });
            return;
        }
        
        
        
        res.status(400).json({ message: 'Invalid user data' });
        return;
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        return;
    }
};

/**
 * @desc    Authenticate user
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        res.status(400).json({ 
            success: false,
            message: 'Please provide both email and password'
        });
        return;
    }

    try {
        // Find user by email (including password field which is normally excluded)
        const user = await User.findOne({ email }).select('+password');

        // Case 1: User doesn't exist
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials' // Generic message for security
            });
            return;
        }

        // Case 2: Demo account login
        if (user.isDemo) {
            const token = generateToken(user.id);

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            
            res.status(200).json({
                success: true,
                data: {
                    id: user.id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    role: user.role,
                    kycStatus: user.kycStatus,
                    balance: user.balance,
                    isDemo: user.isDemo
                },
                token
            });
            return;
        }

        // Case 3: Regular account login
        if (!user.password) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Generate JWT token
        const token = generateToken(user.id);

        // Successful login response
        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                kycStatus: user.kycStatus,
                balance: user.balance,
                isDemo: user.isDemo
            },
            token
        });

    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        // req.user is set by auth middleware
        const user = await User.findById(req.user?.id).select('-password');

        if (user) {
            res.json({
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                kycStatus: user.kycStatus,
                balance: user.balance,
                isDemo: user.isDemo
            });
            return;
        }
        
        res.status(404).json({ message: 'User not found' });
        return;
    } catch (error: any) {
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        return;
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (req.body.balance !== undefined) {
            const parsedBalance = parseFloat(req.body.balance);
            if (!isNaN(parsedBalance)) {
                user.balance = parsedBalance;
            }
        }
        if (req.body.isDemo !== undefined) {
            user.isDemo = req.body.isDemo === 'true' || req.body.isDemo === true;
        }

        if (typeof req.body.kycStatus === 'string') {
            user.kycStatus = req.body.kycStatus;
        }
        if (typeof req.body.email === 'string') user.email = req.body.email;
        
        console.log('req.body: ',req.body);
        

        if (req.body.password && !user.isDemo) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();
        console.log("updatedUser: ", updatedUser);

        res.status(200).json({
            id: updatedUser.id,
            email: updatedUser.email,
            firstname: updatedUser.firstname,
            lastname: updatedUser.lastname,
            role: updatedUser.role,
            kycStatus: updatedUser.kycStatus,
            balance: updatedUser.balance,
            isDemo: updatedUser.isDemo
        });
    } catch (error: any) {
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        return;
    }
};

