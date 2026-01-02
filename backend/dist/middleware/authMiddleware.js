"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.AuthMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
class AuthMiddleware {
    static authenticate(req, res, next) {
        try {
            const auth = req.headers['authorization'];
            if (!auth) {
                throw new errors_1.AuthenticationError('Missing Authorization header');
            }
            const parts = auth.split(' ');
            if (parts.length !== 2 || parts[0] !== 'Bearer') {
                throw new errors_1.AuthenticationError('Invalid Authorization format');
            }
            const token = parts[1];
            if (!token) {
                throw new errors_1.AuthenticationError('Missing token');
            }
            const payload = jwt_1.JWTUtils.verifyToken(token);
            if (!payload) {
                throw new errors_1.AuthenticationError('Invalid token');
            }
            req.user = payload;
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthMiddleware = AuthMiddleware;
// Export the authenticate function directly for easier import
exports.authenticateToken = AuthMiddleware.authenticate;
//# sourceMappingURL=authMiddleware.js.map