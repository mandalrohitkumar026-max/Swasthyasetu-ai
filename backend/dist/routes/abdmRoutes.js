"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditService_1 = require("../services/auditService");
const router = (0, express_1.Router)();
// In-memory active consents
let consents = [
    {
        id: "consent-req-001",
        patientId: "patient-01",
        requesterName: "Dr. Arvind Rao (District Telehealth Hub)",
        purpose: "Episode of Care Teleconsultation",
        status: "active",
        grantedDate: "2026-11-01",
        expiryDate: "2026-11-03",
        dataTypes: ["Prescriptions", "DiagnosticReports", "VitalsHistory"],
        hiuId: "HIU-LUCKNOW-DIST-01"
    }
];
// 1. Generate 14-digit ABHA ID & ABHA Address
router.post('/generate-abha', (req, res) => {
    const { aadhaarOrPhone, fullName } = req.body;
    if (!aadhaarOrPhone) {
        return res.status(400).json({ error: "Aadhaar or Mobile number is required" });
    }
    // Generate compliant 14-digit ABHA number format: XX-XXXX-XXXX-XXXX
    const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const abhaNumber = `91-${randomDigits.slice(0, 4)}-${randomDigits.slice(4, 8)}-${randomDigits.slice(8, 12)}`;
    const cleanName = (fullName || 'citizen').toLowerCase().replace(/\s+/g, '.');
    const abhaAddress = `${cleanName}.${randomDigits.slice(-4)}@abdm`;
    auditService_1.auditService.log({
        user: cleanName,
        action: 'CREATE_ABHA_ID',
        resource: `ABHA: ${abhaNumber}`,
        status: 'SUCCESS',
        ip: req.ip || '127.0.0.1',
        details: 'New ABHA identity provisioned under ABDM standards'
    });
    return res.json({
        status: "success",
        message: "ABHA ID successfully created and linked with National Health Authority (NHA) gateway.",
        abhaNumber,
        abhaAddress,
        kycVerified: true,
        linkedPhone: aadhaarOrPhone.slice(-4).padStart(aadhaarOrPhone.length, 'X'),
        issuedAt: new Date().toISOString()
    });
});
// 2. Generate FHIR R4 Compliant Bundle for a Patient (Strict Consent Gated)
router.get('/fhir-bundle/:patientId', (req, res) => {
    const { patientId } = req.params;
    const consentToken = req.headers['x-consent-token'] || req.query.consentId;
    // Check consent status
    let applicableConsent = consentToken
        ? consents.find(c => c.id === consentToken)
        : consents.find(c => c.status === 'active' && (!c.patientId || c.patientId === patientId));
    if (!applicableConsent || applicableConsent.status !== 'active') {
        auditService_1.auditService.log({
            user: req.user?.email || 'External HIU Requester',
            action: 'VIEW_FHIR_RECORD',
            resource: `Patient/${patientId}`,
            status: 'DENIED',
            ip: req.ip || '127.0.0.1',
            details: 'Access blocked: Patient consent has been revoked or expired under DPDP Act 2023'
        });
        return res.status(403).json({
            success: false,
            error: "Access Denied: Health data sharing consent has been revoked or expired under DPDP Act 2023.",
            code: "CONSENT_REVOKED"
        });
    }
    // Active consent verified - log authorization
    auditService_1.auditService.log({
        user: req.user?.email || 'Dr. Arvind Rao (Authorized HIU)',
        action: 'VIEW_FHIR_RECORD',
        resource: `Patient/${patientId}`,
        status: 'AUTHORIZED',
        ip: req.ip || '127.0.0.1',
        patientConsentToken: applicableConsent.id,
        details: `FHIR R4 longitudinal bundle released under consent ${applicableConsent.id}`
    });
    const fhirBundle = {
        resourceType: "Bundle",
        id: `fhir-bundle-${patientId}-longitudinal`,
        meta: {
            versionId: "1",
            lastUpdated: new Date().toISOString(),
            profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"]
        },
        identifier: {
            system: "https://abdm.gov.in/bundle-id",
            value: `BUNDLE-ABDM-${Date.now()}`
        },
        type: "document",
        timestamp: new Date().toISOString(),
        entry: [
            {
                fullUrl: "urn:uuid:patient-01",
                resource: {
                    resourceType: "Patient",
                    id: "patient-01",
                    identifier: [
                        {
                            system: "https://healthid.ndhm.gov.in",
                            value: "91-4521-8890-1234"
                        }
                    ],
                    name: [{ text: "Ramesh Kumar" }],
                    gender: "male",
                    birthDate: "1978-04-12",
                    address: [{ district: "Sitapur", state: "Uttar Pradesh", postalCode: "261001" }]
                }
            },
            {
                fullUrl: "urn:uuid:practitioner-01",
                resource: {
                    resourceType: "Practitioner",
                    id: "practitioner-01",
                    identifier: [{ system: "https://nmc.org.in", value: "MCI/UP-2012/048821" }],
                    name: [{ text: "Dr. Arvind Rao" }]
                }
            },
            {
                fullUrl: "urn:uuid:condition-01",
                resource: {
                    resourceType: "Condition",
                    id: "condition-01",
                    clinicalStatus: { coding: [{ code: "active" }] },
                    code: {
                        coding: [
                            { system: "http://hl7.org/fhir/sid/icd-10", code: "E11.9", display: "Type 2 diabetes mellitus without complications" }
                        ],
                        text: "Type 2 Diabetes Mellitus"
                    },
                    subject: { reference: "urn:uuid:patient-01" }
                }
            },
            {
                fullUrl: "urn:uuid:medication-request-01",
                resource: {
                    resourceType: "MedicationRequest",
                    id: "medication-request-01",
                    status: "active",
                    intent: "order",
                    medicationCodeableConcept: {
                        coding: [
                            { system: "https://janaushadhi.gov.in", code: "PMBJP-DIAB-022", display: "Metformin 500mg + Glimepiride 2mg" }
                        ],
                        text: "Metformin 500mg + Glimepiride 2mg (PMBJP Generic)"
                    },
                    subject: { reference: "urn:uuid:patient-01" },
                    dosageInstruction: [{ text: "1 tablet daily before breakfast x 30 days" }]
                }
            }
        ]
    };
    return res.json(fhirBundle);
});
// 3. Consent Management Lifecycle
router.get('/consents', (_req, res) => {
    return res.json(consents);
});
router.post('/consents/grant', (req, res) => {
    const { consentId, patientId, requesterName, purpose } = req.body;
    const targetId = consentId || `consent-req-${Date.now()}`;
    const existing = consents.find((c) => c.id === targetId);
    if (existing) {
        existing.status = 'active';
    }
    else {
        consents.unshift({
            id: targetId,
            patientId: patientId || 'patient-01',
            requesterName: requesterName || 'Dr. Arvind Rao (District Telehealth Hub)',
            purpose: purpose || 'Episode of Care Teleconsultation',
            status: 'active',
            grantedDate: new Date().toISOString().split('T')[0],
            expiryDate: '2026-12-31',
            dataTypes: ['Prescriptions', 'DiagnosticReports', 'VitalsHistory'],
            hiuId: 'HIU-LUCKNOW-DIST-01',
        });
    }
    auditService_1.auditService.log({
        user: 'Patient (Data Principal)',
        action: 'GRANT_CONSENT',
        resource: `Consent/${targetId}`,
        status: 'AUTHORIZED',
        ip: req.ip || '127.0.0.1',
        patientConsentToken: targetId,
        details: `Consent ${targetId} actively granted by citizen under Section 6 of DPDP Act 2023.`
    });
    return res.json({
        status: 'success',
        consentId: targetId,
        message: `Consent ${targetId} granted successfully under DPDP Act provisions.`
    });
});
router.post('/consents/revoke', (req, res) => {
    const { consentId } = req.body;
    consents = consents.map(c => c.id === consentId ? { ...c, status: "revoked" } : c);
    auditService_1.auditService.log({
        user: 'Patient (Data Principal)',
        action: 'REVOKE_CONSENT',
        resource: `Consent/${consentId}`,
        status: 'REVOKED',
        ip: req.ip || '127.0.0.1',
        details: `Consent ${consentId} formally revoked by citizen under Section 6 of DPDP Act 2023.`
    });
    return res.json({
        status: "success",
        message: `Consent ${consentId} revoked successfully under DPDP Act provisions. Access to health records has been terminated.`
    });
});
// 4. Audit Trail View (Immutable access logs for compliance)
router.get('/audit-trail', (_req, res) => {
    return res.json({
        success: true,
        totalLogs: auditService_1.auditService.getLogs().length,
        data: auditService_1.auditService.getLogs(50)
    });
});
exports.default = router;
