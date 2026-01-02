import { Router } from 'express';
import { NotificationService } from '../services/notificationService';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.username);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await NotificationService.getUserNotifications(req.user.username);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    await NotificationService.markAsRead(parseInt(req.params.id), req.user.username);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await NotificationService.deleteNotification(parseInt(req.params.id), req.user.username);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;