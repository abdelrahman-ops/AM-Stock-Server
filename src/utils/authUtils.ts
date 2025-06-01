import jwt from 'jsonwebtoken';

export const generateToken = (userId: string) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
        expiresIn: '30d'
    });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET!);
};