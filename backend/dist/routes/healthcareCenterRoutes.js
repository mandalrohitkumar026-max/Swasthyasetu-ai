"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const models_1 = require("../models");
const store_1 = require("../services/store");
const router = (0, express_1.Router)();
// GET / - Public search & filter
router.get('/', async (req, res) => {
    try {
        const { district, type, search } = req.query;
        if (db_1.isDbConnected) {
            const query = { isActive: true };
            if (district && district !== 'All') {
                query.district = new RegExp(district, 'i');
            }
            if (type && type !== 'All') {
                query.type = type;
            }
            if (search) {
                query.$or = [
                    { name: new RegExp(search, 'i') },
                    { address: new RegExp(search, 'i') },
                    { pincode: new RegExp(search, 'i') },
                ];
            }
            const centers = await models_1.HealthcareCenter.find(query).sort({ name: 1 });
            return res.json({ success: true, count: centers.length, data: centers });
        }
        else {
            let centers = store_1.memoryStore.healthcareCenters.filter((c) => c.isActive);
            if (district && district !== 'All') {
                centers = centers.filter((c) => c.district.toLowerCase() === district.toLowerCase());
            }
            if (type && type !== 'All') {
                centers = centers.filter((c) => c.type === type);
            }
            if (search) {
                const q = search.toLowerCase();
                centers = centers.filter((c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) || c.pincode.includes(q));
            }
            return res.json({ success: true, count: centers.length, data: centers });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// GET /:id
router.get('/:id', async (req, res) => {
    try {
        const centerId = req.params.id;
        if (db_1.isDbConnected) {
            const center = await models_1.HealthcareCenter.findById(centerId);
            if (!center) {
                return res.status(404).json({ success: false, error: 'Healthcare center not found' });
            }
            return res.json({ success: true, data: center });
        }
        else {
            const center = store_1.memoryStore.healthcareCenters.find((c) => c._id.toString() === centerId.toString());
            if (!center) {
                return res.status(404).json({ success: false, error: 'Healthcare center not found' });
            }
            return res.json({ success: true, data: center });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
