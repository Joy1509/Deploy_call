import type { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getNotifications = async (req: Request, res: Response) => {
    if (!req.user?.username) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    try {
        // Auto-delete notifications older than 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await prisma.notification.deleteMany({
            where: {
                createdAt: { lt: twentyFourHoursAgo }
            }
        });
        
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.username },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(notifications);
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const getUnreadCount = async (req: Request, res: Response) => {
    if (!req.user?.username) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    try {
        // Auto-delete notifications older than 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await prisma.notification.deleteMany({
            where: {
                createdAt: { lt: twentyFourHoursAgo }
            }
        });
        
        const count = await prisma.notification.count({
            where: { 
                userId: req.user.username,
                isRead: false
            }
        });
        res.json({ count });
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    const notificationId = parseInt(req.params.id || '');
    
    if (!req.user?.username) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    try {
        await prisma.notification.update({
            where: { 
                id: notificationId,
                userId: req.user.username
            },
            data: { isRead: true }
        });
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    const notificationId = parseInt(req.params.id || '');
    
    if (!req.user?.username) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    try {
        await prisma.notification.delete({
            where: { 
                id: notificationId,
                userId: req.user.username
            }
        });
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const bulkDeleteNotifications = async (req: Request, res: Response) => {
    const { notificationIds } = req.body as { notificationIds: number[] };
    
    if (!req.user?.username) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({ error: 'Invalid notification IDs' });
    }
    
    try {
        await prisma.notification.deleteMany({
            where: { 
                id: { in: notificationIds },
                userId: req.user.username
            }
        });
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};