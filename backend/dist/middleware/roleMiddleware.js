"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.RoleMiddleware = void 0;
const errors_1 = require("../utils/errors");
const constants_1 = require("../utils/constants");
class RoleMiddleware {
    static requireRole(roles) {
        return (req, res, next) => {
            try {
                if (!req.user) {
                    throw new errors_1.AuthenticationError('User not authenticated');
                }
                if (!roles.includes(req.user.role)) {
                    throw new errors_1.AuthorizationError(`Access denied. Required roles: ${roles.join(', ')}`);
                }
                next();
            }
            catch (error) {
                next(error);
            }
        };
    }
    static requireHost() {
        return RoleMiddleware.requireRole([constants_1.USER_ROLES.HOST]);
    }
    static requireHostOrAdmin() {
        return RoleMiddleware.requireRole([constants_1.USER_ROLES.HOST, constants_1.USER_ROLES.ADMIN]);
    }
    static requireAnyRole() {
        return RoleMiddleware.requireRole([constants_1.USER_ROLES.HOST, constants_1.USER_ROLES.ADMIN, constants_1.USER_ROLES.ENGINEER]);
    }
}
exports.RoleMiddleware = RoleMiddleware;
// Export the requireRole function directly for easier import
exports.requireRole = RoleMiddleware.requireRole;
//# sourceMappingURL=roleMiddleware.js.map