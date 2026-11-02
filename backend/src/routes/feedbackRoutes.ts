import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { isDbConnected } from '../config/db';
import { Feedback } from '../models';
import { memoryStore } from '../services/store';

const router = Router();

// POST / - Submit feedback
router.post('/', async (req: Request, res: Response) => {
  try {
    const { category, rating, comment, targetId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be a number between 1 and 5' });
    }
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Feedback comment is required' });
    }

    // Try optional auth extraction
    let userId: string | undefined;
    let userRole = 'anonymous';

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], ENV.JWT_SECRET) as any;
        userId = decoded.userId;
        userRole = decoded.role;
      } catch {
        // Continue as anonymous
      }
    }

    const feedbackData = {
      userId,
      userRole,
      category: category || 'general',
      rating,
      comment,
      targetId: targetId || '',
    };

    if (isDbConnected) {
      const feedback = await Feedback.create(feedbackData);
      return res.status(201).json({ success: true, message: 'Thank you for your feedback!', data: feedback });
    } else {
      const feedback = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...feedbackData,
        createdAt: new Date(),
      };
      memoryStore.feedback.unshift(feedback);
      return res.status(201).json({ success: true, message: 'Thank you for your feedback!', data: feedback });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET / - List recent feedback / testimonials
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    if (isDbConnected) {
      const query: any = {};
      if (category) query.category = category;
      const feedbackList = await Feedback.find(query).sort({ createdAt: -1 }).limit(50);
      return res.json({ success: true, count: feedbackList.length, data: feedbackList });
    } else {
      let list = [...memoryStore.feedback];
      if (category) list = list.filter((f) => f.category === category);
      return res.json({ success: true, count: list.length, data: list });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
