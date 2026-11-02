import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth';
import { isDbConnected } from '../config/db';
import { Notification } from '../models';
import { memoryStore } from '../services/store';

const router = Router();

router.use(authenticateToken);

// GET / - List user's notifications
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    if (isDbConnected) {
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
      return res.json({ success: true, count: notifications.length, data: notifications });
    } else {
      const notifications = memoryStore.notifications.filter((n) => n.userId.toString() === userId.toString());
      return res.json({ success: true, count: notifications.length, data: notifications });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /:id/read - Mark as read
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const notificationId = req.params.id;

    if (isDbConnected) {
      const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
      if (!notification) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }
      return res.json({ success: true, data: notification });
    } else {
      const notification = memoryStore.notifications.find((n) => n._id.toString() === notificationId.toString());
      if (!notification) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }
      notification.isRead = true;
      return res.json({ success: true, data: notification });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST / - Send notification (system or admin)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, title, message, type, priority, actionUrl } = req.body;

    const notifData = {
      userId: userId || req.user!.userId,
      title,
      message,
      type: type || 'system',
      priority: priority || 'normal',
      isRead: false,
      actionUrl: actionUrl || '',
    };

    if (isDbConnected) {
      const notification = await Notification.create(notifData);
      return res.status(201).json({ success: true, data: notification });
    } else {
      const notification = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...notifData,
        createdAt: new Date(),
      };
      memoryStore.notifications.unshift(notification);
      return res.status(201).json({ success: true, data: notification });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
