import { verifyToken } from '../utils/jwt';
export function authMiddleware(req, res, next) {
    try {
        const auth = req.headers['authorization'];
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
        const payload = verifyToken(token);
        if (!payload) {
            console.log('Invalid token:', token.substring(0, 20) + '...');
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = payload;
        next();
    }
    catch (err) {
        console.error('Authentication error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
}
export function requireRole(roles) {
    return (req, res, next) => {
        try {
            if (!req.user)
                return res.status(401).json({ error: 'Unauthenticated' });
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            next();
        }
        catch (err) {
            console.error('Authorization error:', err);
            res.status(500).json({ error: 'Authorization failed' });
        }
    };
}
//# sourceMappingURL=auth.js.map