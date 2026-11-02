"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const db_1 = require("../config/db");
const models_1 = require("../models");
const store_1 = require("../services/store");
const router = (0, express_1.Router)();
// POST / - Submit feedback
router.post('/', async (req, res) => {
    try {
        const { category, rating, comment, targetId } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Rating must be a number between 1 and 5' });
        }
        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Feedback comment is required' });
        }
        // Try optional auth extraction
        let userId;
        let userRole = 'anonymous';
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const decoded = jsonwebtoken_1.default.verify(authHeader.split(' ')[1], env_1.ENV.JWT_SECRET);
                userId = decoded.userId;
                userRole = decoded.role;
            }
            catch {
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
        if (db_1.isDbConnected) {
            const feedback = await models_1.Feedback.create(feedbackData);
            return res.status(201).json({ success: true, message: 'Thank you for your feedback!', data: feedback });
        }
        else {
            const feedback = {
                _id: new mongoose_1.default.Types.ObjectId().toString(),
                ...feedbackData,
                createdAt: new Date(),
            };
            store_1.memoryStore.feedback.unshift(feedback);
            return res.status(201).json({ success: true, message: 'Thank you for your feedback!', data: feedback });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// GET / - List recent feedback / testimonials
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        if (db_1.isDbConnected) {
            const query = {};
            if (category)
                query.category = category;
            const feedbackList = await models_1.Feedback.find(query).sort({ createdAt: -1 }).limit(50);
            return res.json({ success: true, count: feedbackList.length, data: feedbackList });
        }
        else {
            let list = [...store_1.memoryStore.feedback];
            if (category)
                list = list.filter((f) => f.category === category);
            return res.json({ success: true, count: list.length, data: list });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
