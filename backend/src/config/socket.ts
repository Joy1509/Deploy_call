import { Server } from 'socket.io';
import { createServer } from 'http';
import type { Express } from 'express';

class SocketConfig {
  private static io: Server;
  private static userSockets = new Map<number, string>();

  public static initialize(app: Express): Server {
    const httpServer = createServer(app);
    
    const allowedOrigins = [
      process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
      'https://call-manage.netlify.app',
      'https://deploy-call.netlify.app',
      'https://deploycall.netlify.app'
    ];

    SocketConfig.io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    SocketConfig.setupEventHandlers();
    return SocketConfig.io;
  }

  private static setupEventHandlers(): void {
    SocketConfig.io.on('connection', (socket) => {
      socket.on('register', (userId: number) => {
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

  public static getIO(): Server {
    if (!SocketConfig.io) {
      throw new Error('Socket.IO not initialized');
    }
    return SocketConfig.io;
  }

  public static emitToAll(event: string, data: any): void {
    if (SocketConfig.io) {
      SocketConfig.io.emit(event, data);
    }
  }

  public static emitToUser(userId: number, event: string, data: any): void {
    const socketId = SocketConfig.userSockets.get(userId);
    if (socketId && SocketConfig.io) {
      SocketConfig.io.to(socketId).emit(event, data);
    }
  }

  public static getUserSockets(): Map<number, string> {
    return SocketConfig.userSockets;
  }
}

export default SocketConfig;