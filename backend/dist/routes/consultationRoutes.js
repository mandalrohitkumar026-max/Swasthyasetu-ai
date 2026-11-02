"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../config/db");
const models_1 = require("../models");
const store_1 = require("../services/store");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
// GET /:id
router.get('/:id', async (req, res) => {
    try {
        const consultationId = req.params.id;
        if (db_1.isDbConnected) {
            const consultation = await models_1.Consultation.findById(consultationId)
                .populate('patientId', 'fullName gender dateOfBirth bloodGroup abhaId')
                .populate('doctorId', 'fullName specialty nmcRegistrationNumber');
            if (!consultation) {
                return res.status(404).json({ success: false, error: 'Consultation record not found' });
            }
            return res.json({ success: true, data: consultation });
        }
        else {
            const consultation = store_1.memoryStore.consultations.find((c) => c._id.toString() === consultationId.toString());
            if (!consultation) {
                return res.status(404).json({ success: false, error: 'Consultation record not found' });
            }
            return res.json({ success: true, data: consultation });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// GET /appointment/:appointmentId
router.get('/appointment/:appointmentId', async (req, res) => {
    try {
        const { appointmentId } = req.params;
        if (db_1.isDbConnected) {
            const consultation = await models_1.Consultation.findOne({ appointmentId })
                .populate('patientId', 'fullName gender dateOfBirth bloodGroup abhaId')
                .populate('doctorId', 'fullName specialty nmcRegistrationNumber');
            if (!consultation) {
                return res.status(404).json({ success: false, error: 'No consultation found for this appointment' });
            }
            return res.json({ success: true, data: consultation });
        }
        else {
            const consultation = store_1.memoryStore.consultations.find((c) => c.appointmentId.toString() === appointmentId.toString());
            if (!consultation) {
                return res.status(404).json({ success: false, error: 'No consultation found for this appointment' });
            }
            return res.json({ success: true, data: consultation });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
