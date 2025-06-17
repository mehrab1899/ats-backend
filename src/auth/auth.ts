// src/auth/auth.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined in environment variables");
}
const JWT_SECRET = process.env.JWT_SECRET;

export interface JWTPayload {
    sub: string;
    role: 'ADMIN';
    iat: number;
    exp: number;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function generateToken(adminId: string): string {
    return jwt.sign({ sub: adminId, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded !== 'object' || decoded === null) {
        throw new Error('Invalid token payload: expected an object');
    }

    const payload = decoded as any;

    // Runtime assertions
    if (
        typeof payload.sub !== 'string' ||
        payload.role !== 'ADMIN' ||
        typeof payload.iat !== 'number' ||
        typeof payload.exp !== 'number'
    ) {
        throw new Error('Invalid token payload structure');
    }

    return {
        sub: payload.sub,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp
    };
}
