import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                username: string;
                role: string;
            };
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const auth = req.headers['authorization'] as string | undefined;
        if (!auth) {
            console.log('Missing Authorization header');
            return res.status(401).json({ error: 'Missing Authorization header' });
        }
        const parts = auth.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            console.log('Invalid Authorization format:', auth);
            return res.status(401).json({ error: 'Invalid Authorization format' });
        }
        const token = parts[1];
        if (!token) {
            console.log('Missing token');
            return res.status(401).json({ error: 'Missing token' });
        }
        const payload = verifyToken(token as string);
        if (!payload) {
            console.log('Invalid token:', token.substring(0, 20) + '...');
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = payload;
        next();
    } catch (err: any) {
        console.error('Authentication error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
}

export function requireRole(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            next();
        } catch (err: any) {
            console.error('Authorization error:', err);
            res.status(500).json({ error: 'Authorization failed' });
        }
    };
}