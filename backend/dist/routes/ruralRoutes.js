"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../services/store");
const router = (0, express_1.Router)();
// Rural Health Education Pamphlets (Verified Public Health Guidelines)
const HEALTH_EDUCATION_PAMPHLETS = [
    {
        id: 'maternal-care',
        title_en: 'Maternal Antenatal & Postnatal Care Guide',
        title_hi: 'मातृ एवं शिशु देखभाल - गर्भावस्था गाइड',
        category: 'Maternal Health',
        summary_en: 'Critical guidance on minimum 4 ANC checkups, iron-folic acid supplementation, tetanus toxoid vaccination, and Janani Suraksha Yojana benefits.',
        summary_hi: 'गर्भावस्था में कम से कम 4 जांचें, आयरन व फोलिक एसिड की गोलियां, टिटनेस का टीका एवं जननी सुरक्षा योजना का लाभ।',
        actionSteps_en: [
            'Register pregnancy at the nearest Anganwadi / Sub-centre within first trimester.',
            'Take 1 Iron Folic Acid (IFA) tablet daily for 180 days after first trimester.',
            'Plan institutional delivery at District Civil Hospital or CHC for emergency obstetric safety.'
        ],
        actionSteps_hi: [
            'पहली तिमाही में नजदीकी आंगनवाड़ी या उप-केंद्र पर पंजीकरण अवश्य कराएं।',
            'चौथे महीने से रोजाना 1 आयरन-फोलिक एसिड की लाल गोली 180 दिनों तक लें।',
            'सुरक्षित प्रसव हेतु प्राथमिक स्वास्थ्य केंद्र या जिला अस्पताल का चयन करें।'
        ],
        verifiedAuthority: 'National Health Mission (NHM) / Ministry of Health & Family Welfare'
    },
    {
        id: 'child-nutrition',
        title_en: 'Childhood Nutrition & Stunting Prevention (Poshan Abhiyaan)',
        title_hi: 'बाल पोषण एवं विकास - सही पोषण देश रोशन',
        category: 'Child Health',
        summary_en: 'Exclusive breastfeeding for the first 6 months, timely complementary feeding, and monitoring growth charts at Anganwadi centers.',
        summary_hi: 'जन्म के पहले 6 माह तक केवल मां का दूध, 6 माह बाद पूरक सुपाच्य आहार और नियमित वजन की निगरानी।',
        actionSteps_en: [
            'Initiate breastfeeding within 1 hour of birth (colostrum is the child\'s first vaccine).',
            'Do not give water, honey, or animal milk before 6 months.',
            'Introduce mashed dal-khichdi, eggs, and boiled vegetables from 6 months onwards.'
        ],
        actionSteps_hi: [
            'जन्म के एक घंटे के भीतर मां का पहला गाढ़ा पीला दूध (खीस) अवश्य पिलाएं।',
            '6 महीने तक बच्चे को घुट्टी, पानी या जानवर का दूध बिल्कुल न दें।',
            '6 माह पूर्ण होने पर मसली हुई दाल-खिचड़ी, केला व उबली सब्जियां शुरू करें।'
        ],
        verifiedAuthority: 'Poshan Abhiyaan / ICMR-National Institute of Nutrition'
    },
    {
        id: 'diarrhea-ors',
        title_en: 'Acute Diarrhea Management & Oral Rehydration (ORS + Zinc)',
        title_hi: 'दस्त एवं निर्जलीकरण से बचाव - ओआरएस एवं जिंक घोल',
        category: 'Waterborne Disease',
        summary_en: 'Preventing severe dehydration in children and adults using WHO low-osmolarity ORS and 14 days of dispersible Zinc tablets.',
        summary_hi: 'ओआरएस घोल और 14 दिनों तक जिंक की गोली से गंभीर निर्जलीकरण (पानी की कमी) की रोकथाम।',
        actionSteps_en: [
            'Dissolve 1 entire packet of ORS in 1 litre of clean drinking water.',
            'Give sips of ORS after every loose stool; do not stop feeding.',
            'Administer 20mg Zinc tablet daily for 14 continuous days to prevent recurrence.'
        ],
        actionSteps_hi: [
            'ओआरएस का पूरा पैकेट 1 लीटर स्वच्छ उबले पानी में अच्छी तरह घोलें।',
            'हर बार पतले दस्त के बाद बच्चे को कटोरी-चम्मच से ओआरएस का घोल पिलाएं।',
            'दस्त रुकने के बाद भी लगातार 14 दिनों तक जिंक की गोली अवश्य दें।'
        ],
        verifiedAuthority: 'WHO-UNICEF Clinical Diarrhea Guidelines'
    },
    {
        id: 'hypertension-control',
        title_en: 'Rural Hypertension Screening & Salt Restriction',
        title_hi: 'उच्च रक्तचाप (बीपी) नियंत्रण एवं खानपान',
        category: 'Non-Communicable Diseases (NCD)',
        summary_en: 'Managing blood pressure through dietary sodium restriction (<5g/day), daily walking, and unhindered adherence to Jan Aushadhi generic Amlodipine/Telmisartan.',
        summary_hi: 'कम नमक का सेवन, प्रतिदिन 30 मिनट तेज चाल और नियमित दवा से सामान्य रक्तचाप बनाए रखें।',
        actionSteps_en: [
            'Check blood pressure monthly at your nearest Gram Panchayat Kiosk or Sub-centre.',
            'Cut down intake of papad, pickles, and salty packaged snacks.',
            'Never stop blood pressure medications without consulting your physician.'
        ],
        actionSteps_hi: [
            'ग्राम पंचायत कियोस्क पर हर महीने निःशुल्क बीपी की जांच अवश्य कराएं।',
            'अचार, पापड़ और ज्यादा नमक वाली चीजों का सेवन तुरंत कम करें।',
            'बिना डॉक्टर की सलाह के बीपी की दवा कभी बंद न करें।'
        ],
        verifiedAuthority: 'India Hypertension Control Initiative (IHCI - ICMR)'
    },
    {
        id: 'dengue-malaria-prevention',
        title_en: 'Monsoon Vector-Borne Fever (Dengue & Malaria) Control',
        title_hi: 'डेंगू, मलेरिया एवं संक्रामक बुखार की रोकथाम',
        category: 'Vector-Borne Disease',
        summary_en: 'Preventing mosquito breeding in standing water, recognizing warning signs (bleeding, platelet drop), and using free rapid diagnostic kits.',
        summary_hi: 'ठहरे पानी में मच्छर पनपने से रोकें, तेज बुखार में तुरंत जांच कराएं और मच्छरदानी का उपयोग करें।',
        actionSteps_en: [
            'Empty and clean water coolers, tires, and flowerpots once a week (Dry Day observance).',
            'Sleep under insecticide-treated bed nets (ITNs), especially during dusk and dawn.',
            'In case of sudden high fever with body ache, get tested for Dengue NS1/Malaria at PHC.'
        ],
        actionSteps_hi: [
            'कूलर, गमले और पुराने बर्तनों का पानी हफ्ते में एक बार जरूर खाली करें।',
            'सोते समय मच्छरदानी का प्रयोग करें और पूरी आस्तीन के कपड़े पहनें।',
            'तेज बुखार आने पर तुरंत नजदीकी स्वास्थ्य केंद्र जाकर निःशुल्क खून की जांच कराएं।'
        ],
        verifiedAuthority: 'National Vector Borne Disease Control Programme (NVBDCP)'
    }
];
// 1. GET /api/rural/health-education
router.get('/health-education', (req, res) => {
    const { category, lang } = req.query;
    let items = HEALTH_EDUCATION_PAMPHLETS;
    if (category && category !== 'all') {
        items = items.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()));
    }
    return res.json({
        success: true,
        count: items.length,
        language: lang || 'en',
        data: items,
    });
});
// 2. GET /api/rural/kiosks - Gram Panchayat Telemedicine Kiosks
router.get('/kiosks', (_req, res) => {
    const kiosks = store_1.memoryStore.healthcareCenters.filter((c) => c.type === 'telemedicine_kiosk' || c.servicesOffered?.some((s) => s.toLowerCase().includes('kiosk')));
    return res.json({
        success: true,
        count: kiosks.length,
        technologyNotes: 'Kiosks run on 16 kbps Opus 2G cellular bandwidth with battery-backup IoT telemetry kits.',
        data: kiosks,
    });
});
// 3. GET /api/rural/low-bandwidth-bundle - Ultra-compact offline directory (<8KB)
router.get('/low-bandwidth-bundle', (_req, res) => {
    const compactCenters = store_1.memoryStore.healthcareCenters.map((c) => ({
        i: c._id,
        n: c.name,
        c: c.category,
        p: c.contactNumber,
        h: c.operatingHours,
        e: c.emergencyCasualtyAvailable ? 1 : 0,
    }));
    const bundle = {
        v: 1,
        t: new Date().toISOString(),
        emergencyHelpline: '108',
        mentalHealthHelpline: '14416',
        pmbjpHelpline: '1800-180-8080',
        centers: compactCenters,
    };
    return res.json(bundle);
});
exports.default = router;
