import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

let io: Server;
const userSockets = new Map<number, string>();

export function initializeSocket(httpServer: HttpServer) {
    const allowedOrigins = [
        process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
        'https://call-manage.netlify.app',
        'https://deploy-call.netlify.app',
        'https://deploycall.netlify.app'
    ];

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        socket.on('register', (userId: number) => {
            userSockets.set(userId, socket.id);
        });
        
        socket.on('disconnect', () => {
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
}

export function emitToAll(event: string, data: any) {
    if (io) {
        io.emit(event, data);
    }
}

export function emitToUser(userId: number, event: string, data: any) {
    if (io) {
        const socketId = userSockets.get(userId);
        if (socketId) {
            io.to(socketId).emit(event, data);
        }
    }
}

export { userSockets };