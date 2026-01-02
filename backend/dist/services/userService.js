"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const constants_1 = require("../utils/constants");
const socket_1 = __importDefault(require("../config/socket"));
class UserService {
    static async getAllUsers() {
        return await database_1.prisma.user.findMany({
            select: { id: true, username: true, email: true, phone: true, role: true, createdAt: true }
        });
    }
    static async createUser(userData) {
        const { username, password, email, phone, role, secretPassword } = userData;
        // Check if user already exists
        const existingUser = await database_1.prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email },
                    { phone }
                ]
            }
        });
        if (existingUser) {
            if (existingUser.username === username) {
                throw new errors_1.ConflictError('Username already exists');
            }
            if (existingUser.email === email) {
                throw new errors_1.ConflictError('Email already exists');
            }
            if (existingUser.phone === phone) {
                throw new errors_1.ConflictError('Phone number already exists');
            }
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const finalSecretPassword = role === constants_1.USER_ROLES.HOST ? (secretPassword || 'DEFAULTSECRET') : 'DEFAULTSECRET';
        const user = await database_1.prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                email,
                phone,
                role,
                secretPassword: finalSecretPassword
            }
        });
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt
        };
        // Emit real-time event
        socket_1.default.emitToAll('user_created', userResponse);
        return userResponse;
    }
    static async updateUser(userId, userData) {
        const currentUser = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!currentUser) {
            throw new errors_1.NotFoundError('User not found');
        }
        const updateData = {};
        // Check for conflicts with other users
        if (userData.username && userData.username !== currentUser.username) {
            const existingUser = await database_1.prisma.user.findUnique({ where: { username: userData.username } });
            if (existingUser) {
                throw new errors_1.ConflictError('Username already exists');
            }
            updateData.username = userData.username;
        }
        if (userData.email && userData.email !== currentUser.email) {
            const existingUser = await database_1.prisma.user.findUnique({ where: { email: userData.email } });
            if (existingUser) {
                throw new errors_1.ConflictError('Email already exists');
            }
            updateData.email = userData.email;
        }
        if (userData.phone && userData.phone !== currentUser.phone) {
            const existingUser = await database_1.prisma.user.findUnique({ where: { phone: userData.phone } });
            if (existingUser) {
                throw new errors_1.ConflictError('Phone number already exists');
            }
            updateData.phone = userData.phone;
        }
        if (userData.password) {
            updateData.password = await bcryptjs_1.default.hash(userData.password, 10);
        }
        if (userData.role && Object.values(constants_1.USER_ROLES).includes(userData.role)) {
            updateData.role = userData.role;
            // Handle secret password based on role change
            if (userData.role === constants_1.USER_ROLES.HOST && currentUser.role !== constants_1.USER_ROLES.HOST) {
                updateData.secretPassword = userData.secretPassword || 'DEFAULTSECRET';
            }
            else if (userData.role !== constants_1.USER_ROLES.HOST && currentUser.role === constants_1.USER_ROLES.HOST) {
                updateData.secretPassword = 'DEFAULTSECRET';
            }
        }
        const user = await database_1.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, username: true, email: true, phone: true, role: true, createdAt: true }
        });
        // Force logout the updated user via WebSocket
        const userSockets = socket_1.default.getUserSockets();
        const socketId = userSockets.get(userId);
        if (socketId) {
            socket_1.default.getIO().to(socketId).emit('force_logout', {
                message: 'Your account has been updated. Please log in again.'
            });
        }
        // Emit real-time event
        socket_1.default.emitToAll('user_updated', user);
        return user;
    }
    static async deleteUser(userId) {
        const currentUser = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!currentUser) {
            throw new errors_1.NotFoundError('User not found');
        }
        // Unassign all calls assigned to this user
        const callsToUnassign = await database_1.prisma.call.findMany({
            where: { assignedTo: currentUser.username }
        });
        await database_1.prisma.call.updateMany({
            where: { assignedTo: currentUser.username },
            data: {
                assignedTo: null,
                status: 'PENDING',
                assignedAt: null,
                assignedBy: null,
                engineerRemark: null
            }
        });
        // Emit individual call updates for each unassigned call
        for (const call of callsToUnassign) {
            const updatedCall = {
                ...call,
                assignedTo: null,
                status: 'PENDING',
                assignedAt: null,
                assignedBy: null,
                engineerRemark: null
            };
            socket_1.default.emitToAll('call_updated', updatedCall);
        }
        // Force logout the user before deletion via WebSocket
        const userSockets = socket_1.default.getUserSockets();
        const socketId = userSockets.get(userId);
        if (socketId) {
            socket_1.default.getIO().to(socketId).emit('force_logout', {
                message: 'Your account has been removed by an administrator.'
            });
        }
        await database_1.prisma.user.delete({ where: { id: userId } });
        // Emit real-time event
        socket_1.default.emitToAll('user_deleted_broadcast', {
            id: userId,
            username: currentUser.username
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map