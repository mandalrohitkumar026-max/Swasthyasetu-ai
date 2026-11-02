"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const models_1 = require("../models");
const store_1 = require("../services/store");
const router = (0, express_1.Router)();
// GET / - Public list of verified doctors with filters
router.get('/', async (req, res) => {
    try {
        const { specialty, language, maxFee, search } = req.query;
        if (db_1.isDbConnected) {
            const query = { verificationStatus: 'verified' };
            if (specialty && specialty !== 'All') {
                query.specialty = new RegExp(specialty, 'i');
            }
            if (language && language !== 'All') {
                query.languages = new RegExp(language, 'i');
            }
            if (maxFee) {
                query.consultationFee = { $lte: parseFloat(maxFee) };
            }
            if (search) {
                query.$or = [
                    { fullName: new RegExp(search, 'i') },
                    { specialty: new RegExp(search, 'i') },
                    { hospitalAffiliation: new RegExp(search, 'i') },
                ];
            }
            const doctors = await models_1.Doctor.find(query).select('-__v').sort({ rating: -1 });
            return res.json({ success: true, count: doctors.length, data: doctors });
        }
        else {
            let doctors = store_1.memoryStore.doctors.filter((d) => d.verificationStatus === 'verified');
            if (specialty && specialty !== 'All') {
                doctors = doctors.filter((d) => d.specialty.toLowerCase() === specialty.toLowerCase());
            }
            if (language && language !== 'All') {
                doctors = doctors.filter((d) => d.languages.some((l) => l.toLowerCase() === language.toLowerCase()));
            }
            if (maxFee) {
                const fee = parseFloat(maxFee);
                doctors = doctors.filter((d) => d.consultationFee <= fee);
            }
            if (search) {
                const q = search.toLowerCase();
                doctors = doctors.filter((d) => d.fullName.toLowerCase().includes(q) ||
                    d.specialty.toLowerCase().includes(q) ||
                    d.hospitalAffiliation.toLowerCase().includes(q));
            }
            return res.json({ success: true, count: doctors.length, data: doctors });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// GET /:id - Single doctor public profile
router.get('/:id', async (req, res) => {
    try {
        const doctorId = req.params.id;
        if (db_1.isDbConnected) {
            const doctor = await models_1.Doctor.findById(doctorId).select('-__v');
            if (!doctor) {
                return res.status(404).json({ success: false, error: 'Doctor not found' });
            }
            return res.json({ success: true, data: doctor });
        }
        else {
            const doctor = store_1.memoryStore.doctors.find((d) => d._id.toString() === doctorId.toString());
            if (!doctor) {
                return res.status(404).json({ success: false, error: 'Doctor not found' });
            }
            return res.json({ success: true, data: doctor });
        }
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
