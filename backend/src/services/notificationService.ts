import { prisma } from '../config/database';
import DatabaseConfig from '../config/database';
import { SECURITY, NOTIFICATION_TYPES } from '../utils/constants';
import SocketConfig from '../config/socket';

export interface NotificationData {
  userId: string;
  message: string;
  type: string;
  callId?: number;
}

export class NotificationService {
  public static async createNotification(data: NotificationData): Promise<void> {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        message: data.message,
        type: data.type,
        callId: data.callId || null
      }
    });

    // Emit real-time notification
    SocketConfig.emitToAll('notification_created', notification);
  }

  public static async createMultipleNotifications(notifications: NotificationData[]): Promise<void> {
    if (notifications.length === 0) return;

    await prisma.notification.createMany({
      data: notifications
    });

    // Emit real-time notifications
    notifications.forEach(notification => {
      SocketConfig.emitToAll('notification_created', notification);
    });
  }

  public static async getUserNotifications(userId: string): Promise<any[]> {
    // Auto-delete notifications older than 24 hours
    await NotificationService.cleanupOldNotifications();

    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  public static async getUnreadCount(userId: string): Promise<number> {
    try {
      // Auto-delete notifications older than 24 hours
      await NotificationService.cleanupOldNotifications();

      return await DatabaseConfig.withRetry(async () => {
        return await prisma.notification.count({
          where: {
            userId,
            isRead: false
          }
        });
      });
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0; // Return 0 if database is unavailable
    }
  }

  public static async markAsRead(notificationId: number, userId: string): Promise<void> {
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId
      },
      data: { isRead: true }
    });
  }

  public static async deleteNotification(notificationId: number, userId: string): Promise<void> {
    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId
      }
    });
  }

  public static async bulkDeleteNotifications(notificationIds: number[], userId: string): Promise<void> {
    await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId
      }
    });
  }

  public static async cleanupOldNotifications(): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - SECURITY.NOTIFICATION_CLEANUP_HOURS * 60 * 60 * 1000);
      const result = await DatabaseConfig.withRetry(async () => {
        return await prisma.notification.deleteMany({
          where: {
            createdAt: { lt: cutoffTime }
          }
        });
      });
      
      if (result.count > 0) {
        console.log(`Cleaned up ${result.count} old notifications`);
      }
    } catch (error) {
      console.error('Failed to cleanup old notifications:', error);
    }
  }

  public static async notifyDuplicateCall(call: any, currentUsername: string): Promise<void> {
    const notifications: NotificationData[] = [];

    // Notify original creator if different from current user
    if (call.createdBy && call.createdBy !== currentUsername) {
      notifications.push({
        userId: call.createdBy,
        message: `Customer: ${call.customerName} (${call.phone}) called again about: ${call.category}`,
        type: NOTIFICATION_TYPES.DUPLICATE_CALL,
        callId: call.id
      });
    }

    // Notify assigned engineer if different from current user and call is assigned
    if (call.assignedTo && call.assignedTo !== currentUsername) {
      notifications.push({
        userId: call.assignedTo,
        message: `Customer: ${call.customerName} (${call.phone}) called again about: ${call.category}`,
        type: NOTIFICATION_TYPES.DUPLICATE_CALL,
        callId: call.id
      });
    }

    // Notify all HOSTs and ADMINs
    const admins = await prisma.user.findMany({
      where: { role: { in: ['HOST', 'ADMIN'] } },
      select: { username: true }
    });

    admins.forEach((admin: any) => {
      if (admin.username !== currentUsername) {
        notifications.push({
          userId: admin.username,
          message: `Repeat call: ${call.customerName} (${call.phone}) - ${call.category}`,
          type: NOTIFICATION_TYPES.DUPLICATE_CALL,
          callId: call.id
        });
      }
    });

    if (notifications.length > 0) {
      await NotificationService.createMultipleNotifications(notifications);
    }
  }
}

// Run cleanup every hour
setInterval(() => {
  NotificationService.cleanupOldNotifications();
}, 60 * 60 * 1000);