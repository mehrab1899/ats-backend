// src/auth/middleware.ts
import { verifyToken } from './auth';
import { AuthenticationError } from 'apollo-server-errors';

export function getAdminFromRequest(req: any) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) return null;

    try {
        const payload = verifyToken(token);
        return { adminId: payload.sub, role: payload.role };
    } catch (err) {
        // Do NOT throw an error here — just return null for unauthenticated requests
        return null;
    }
}