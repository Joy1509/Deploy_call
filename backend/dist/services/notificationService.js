"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const database_1 = require("../config/database");
const constants_1 = require("../utils/constants");
const socket_1 = __importDefault(require("../config/socket"));
class NotificationService {
    static async createNotification(data) {
        const notification = await database_1.prisma.notification.create({
            data: {
                userId: data.userId,
                message: data.message,
                type: data.type,
                callId: data.callId || null
            }
        });
        // Emit real-time notification
        socket_1.default.emitToAll('notification_created', notification);
    }
    static async createMultipleNotifications(notifications) {
        if (notifications.length === 0)
            return;
        await database_1.prisma.notification.createMany({
            data: notifications
        });
        // Emit real-time notifications
        notifications.forEach(notification => {
            socket_1.default.emitToAll('notification_created', notification);
        });
    }
    static async getUserNotifications(userId) {
        // Auto-delete notifications older than 24 hours
        await NotificationService.cleanupOldNotifications();
        return await database_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }
    static async getUnreadCount(userId) {
        // Auto-delete notifications older than 24 hours
        await NotificationService.cleanupOldNotifications();
        return await database_1.prisma.notification.count({
            where: {
                userId,
                isRead: false
            }
        });
    }
    static async markAsRead(notificationId, userId) {
        await database_1.prisma.notification.update({
            where: {
                id: notificationId,
                userId
            },
            data: { isRead: true }
        });
    }
    static async deleteNotification(notificationId, userId) {
        await database_1.prisma.notification.delete({
            where: {
                id: notificationId,
                userId
            }
        });
    }
    static async bulkDeleteNotifications(notificationIds, userId) {
        await database_1.prisma.notification.deleteMany({
            where: {
                id: { in: notificationIds },
                userId
            }
        });
    }
    static async cleanupOldNotifications() {
        try {
            const cutoffTime = new Date(Date.now() - constants_1.SECURITY.NOTIFICATION_CLEANUP_HOURS * 60 * 60 * 1000);
            const result = await database_1.prisma.notification.deleteMany({
                where: {
                    createdAt: { lt: cutoffTime }
                }
            });
            if (result.count > 0) {
                console.log(`Cleaned up ${result.count} old notifications`);
            }
        }
        catch (error) {
            console.error('Failed to cleanup old notifications:', error);
        }
    }
    static async notifyDuplicateCall(call, currentUsername) {
        const notifications = [];
        // Notify original creator if different from current user
        if (call.createdBy && call.createdBy !== currentUsername) {
            notifications.push({
                userId: call.createdBy,
                message: `Customer: ${call.customerName} (${call.phone}) called again about: ${call.category}`,
                type: constants_1.NOTIFICATION_TYPES.DUPLICATE_CALL,
                callId: call.id
            });
        }
        // Notify assigned engineer if different from current user and call is assigned
        if (call.assignedTo && call.assignedTo !== currentUsername) {
            notifications.push({
                userId: call.assignedTo,
                message: `Customer: ${call.customerName} (${call.phone}) called again about: ${call.category}`,
                type: constants_1.NOTIFICATION_TYPES.DUPLICATE_CALL,
                callId: call.id
            });
        }
        // Notify all HOSTs and ADMINs
        const admins = await database_1.prisma.user.findMany({
            where: { role: { in: ['HOST', 'ADMIN'] } },
            select: { username: true }
        });
        admins.forEach((admin) => {
            if (admin.username !== currentUsername) {
                notifications.push({
                    userId: admin.username,
                    message: `Repeat call: ${call.customerName} (${call.phone}) - ${call.category}`,
                    type: constants_1.NOTIFICATION_TYPES.DUPLICATE_CALL,
                    callId: call.id
                });
            }
        });
        if (notifications.length > 0) {
            await NotificationService.createMultipleNotifications(notifications);
        }
    }
}
exports.NotificationService = NotificationService;
// Run cleanup every hour
setInterval(() => {
    NotificationService.cleanupOldNotifications();
}, 60 * 60 * 1000);
//# sourceMappingURL=notificationService.js.map