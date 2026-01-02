import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { USER_ROLES } from '../utils/constants';
import SocketConfig from '../config/socket';
import type { CreateUserInput, UpdateUserInput } from '../utils/validation';

export class UserService {
  public static async getAllUsers(): Promise<any[]> {
    return await prisma.user.findMany({
      select: { id: true, username: true, email: true, phone: true, role: true, createdAt: true }
    });
  }

  public static async createUser(userData: CreateUserInput): Promise<any> {
    const { username, password, email, phone, role, secretPassword } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
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
        throw new ConflictError('Username already exists');
      }
      if (existingUser.email === email) {
        throw new ConflictError('Email already exists');
      }
      if (existingUser.phone === phone) {
        throw new ConflictError('Phone number already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalSecretPassword = role === USER_ROLES.HOST ? (secretPassword || 'DEFAULTSECRET') : 'DEFAULTSECRET';

    const user = await prisma.user.create({
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
    SocketConfig.emitToAll('user_created', userResponse);

    return userResponse;
  }

  public static async updateUser(userId: number, userData: UpdateUserInput): Promise<any> {
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    const updateData: any = {};

    // Check for conflicts with other users
    if (userData.username && userData.username !== currentUser.username) {
      const existingUser = await prisma.user.findUnique({ where: { username: userData.username } });
      if (existingUser) {
        throw new ConflictError('Username already exists');
      }
      updateData.username = userData.username;
    }

    if (userData.email && userData.email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
      if (existingUser) {
        throw new ConflictError('Email already exists');
      }
      updateData.email = userData.email;
    }

    if (userData.phone && userData.phone !== currentUser.phone) {
      const existingUser = await prisma.user.findUnique({ where: { phone: userData.phone } });
      if (existingUser) {
        throw new ConflictError('Phone number already exists');
      }
      updateData.phone = userData.phone;
    }

    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10);
    }

    if (userData.role && Object.values(USER_ROLES).includes(userData.role as any)) {
      updateData.role = userData.role;

      // Handle secret password based on role change
      if (userData.role === USER_ROLES.HOST && currentUser.role !== USER_ROLES.HOST) {
        updateData.secretPassword = userData.secretPassword || 'DEFAULTSECRET';
      } else if (userData.role !== USER_ROLES.HOST && currentUser.role === USER_ROLES.HOST) {
        updateData.secretPassword = 'DEFAULTSECRET';
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, username: true, email: true, phone: true, role: true, createdAt: true }
    });

    // Force logout the updated user via WebSocket
    const userSockets = SocketConfig.getUserSockets();
    const socketId = userSockets.get(userId);
    if (socketId) {
      SocketConfig.getIO().to(socketId).emit('force_logout', { 
        message: 'Your account has been updated. Please log in again.' 
      });
    }

    // Emit real-time event
    SocketConfig.emitToAll('user_updated', user);

    return user;
  }

  public static async deleteUser(userId: number): Promise<void> {
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    // Unassign all calls assigned to this user
    const callsToUnassign = await prisma.call.findMany({
      where: { assignedTo: currentUser.username }
    });

    await prisma.call.updateMany({
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
      SocketConfig.emitToAll('call_updated', updatedCall);
    }

    // Force logout the user before deletion via WebSocket
    const userSockets = SocketConfig.getUserSockets();
    const socketId = userSockets.get(userId);
    if (socketId) {
      SocketConfig.getIO().to(socketId).emit('force_logout', { 
        message: 'Your account has been removed by an administrator.' 
      });
    }

    await prisma.user.delete({ where: { id: userId } });

    // Emit real-time event
    SocketConfig.emitToAll('user_deleted_broadcast', { 
      id: userId, 
      username: currentUser.username 
    });
  }
}