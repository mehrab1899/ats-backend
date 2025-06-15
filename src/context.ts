import { Request } from 'express';
import { verifyToken } from './auth/auth'; // Adjust the path as needed

export interface Context {
    userId: number | null;
}

export const context = ({ req }: { req: Request }): Context => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    let userId: number | null = null;
    if (token) {
        try {
            const payload = verifyToken(token);
            userId = payload.sub;
        } catch (err) {
            userId = null; // Invalid token
        }
    }

    return { userId };
};
