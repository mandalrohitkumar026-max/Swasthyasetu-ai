"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const db_1 = require("../config/db");
const models_1 = require("../models");
const store_1 = require("../services/store");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
// GET / - List user's notifications
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        if (db_1.isDbConnected) {
            const notifications = await models_1.Notification.find({ userId }).sort({ createdAt: -1 });
            return res.json({ success: true, count: notifications.length, data: notifications });
        }
        else {
            const notifications = store_1.memoryStore.notifications.filter((n) => n.userId.toString() === userId.toString());
            return res.json({ success: true, count: notifications.length, data: notifications });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /:id/read - Mark as read
router.put('/:id/read', async (req, res) => {
    try {
        const notificationId = req.params.id;
        if (db_1.isDbConnected) {
            const notification = await models_1.Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
            if (!notification) {
                return res.status(404).json({ success: false, error: 'Notification not found' });
            }
            return res.json({ success: true, data: notification });
        }
        else {
            const notification = store_1.memoryStore.notifications.find((n) => n._id.toString() === notificationId.toString());
            if (!notification) {
                return res.status(404).json({ success: false, error: 'Notification not found' });
            }
            notification.isRead = true;
            return res.json({ success: true, data: notification });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// POST / - Send notification (system or admin)
router.post('/', async (req, res) => {
    try {
        const { userId, title, message, type, priority, actionUrl } = req.body;
        const notifData = {
            userId: userId || req.user.userId,
            title,
            message,
            type: type || 'system',
            priority: priority || 'normal',
            isRead: false,
            actionUrl: actionUrl || '',
        };
        if (db_1.isDbConnected) {
            const notification = await models_1.Notification.create(notifData);
            return res.status(201).json({ success: true, data: notification });
        }
        else {
            const notification = {
                _id: new mongoose_1.default.Types.ObjectId().toString(),
                ...notifData,
                createdAt: new Date(),
            };
            store_1.memoryStore.notifications.unshift(notification);
            return res.status(201).json({ success: true, data: notification });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
