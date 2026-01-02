"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = require("http");
class SocketConfig {
    static initialize(app) {
        const httpServer = (0, http_1.createServer)(app);
        const allowedOrigins = [
            process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
            'https://call-manage.netlify.app',
            'https://deploy-call.netlify.app',
            'https://deploycall.netlify.app'
        ];
        SocketConfig.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: allowedOrigins,
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        SocketConfig.setupEventHandlers();
        return SocketConfig.io;
    }
    static setupEventHandlers() {
        SocketConfig.io.on('connection', (socket) => {
            socket.on('register', (userId) => {
                SocketConfig.userSockets.set(userId, socket.id);
            });
            socket.on('disconnect', () => {
                for (const [userId, socketId] of SocketConfig.userSockets.entries()) {
                    if (socketId === socket.id) {
                        SocketConfig.userSockets.delete(userId);
                        break;
                    }
                }
            });
        });
    }
    static getIO() {
        if (!SocketConfig.io) {
            throw new Error('Socket.IO not initialized');
        }
        return SocketConfig.io;
    }
    static emitToAll(event, data) {
        if (SocketConfig.io) {
            SocketConfig.io.emit(event, data);
        }
    }
    static emitToUser(userId, event, data) {
        const socketId = SocketConfig.userSockets.get(userId);
        if (socketId && SocketConfig.io) {
            SocketConfig.io.to(socketId).emit(event, data);
        }
    }
    static getUserSockets() {
        return SocketConfig.userSockets;
    }
}
SocketConfig.userSockets = new Map();
exports.default = SocketConfig;
//# sourceMappingURL=socket.js.map