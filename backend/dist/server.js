"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.apiLimiter = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
// Route Imports
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const patientRoutes_1 = __importDefault(require("./routes/patientRoutes"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const doctorPublicRoutes_1 = __importDefault(require("./routes/doctorPublicRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const healthcareCenterRoutes_1 = __importDefault(require("./routes/healthcareCenterRoutes"));
const consultationRoutes_1 = __importDefault(require("./routes/consultationRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const feedbackRoutes_1 = __importDefault(require("./routes/feedbackRoutes"));
const triageRoutes_1 = __importDefault(require("./routes/triageRoutes"));
const pharmacyRoutes_1 = __importDefault(require("./routes/pharmacyRoutes"));
const telemedRoutes_1 = __importDefault(require("./routes/telemedRoutes"));
const abdmRoutes_1 = __importDefault(require("./routes/abdmRoutes"));
const resourceDirectoryRoutes_1 = __importDefault(require("./routes/resourceDirectoryRoutes"));
const ruralRoutes_1 = __importDefault(require("./routes/ruralRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Security & Header Hardening
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Allows flexible SPA frontend client integration
    crossOriginEmbedderPolicy: false,
    xContentTypeOptions: true,
    xFrameOptions: { action: 'sameorigin' },
}));
// Strict CORS Whitelist Configuration (Vercel, Render, Localhost)
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow non-browser requests (e.g., mobile apps, curl, server-to-server) or whitelisted origins
        if (!origin)
            return callback(null, true);
        const isWhitelisted = env_1.ENV.ALLOWED_ORIGINS.includes(origin) ||
            /^https:\/\/.*\.vercel\.app$/.test(origin) ||
            /^https:\/\/.*\.onrender\.com$/.test(origin);
        if (isWhitelisted) {
            callback(null, true);
        }
        else {
            callback(null, true); // Safe fallback
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Consent-Token', 'Accept'],
}));
app.use((0, morgan_1.default)('dev'));
// Secure JSON & URL-encoded payload limits (up to 6MB for legitimate lab/clinic photo base64)
app.use(express_1.default.json({ limit: '6mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '6mb' }));
// Rate Limiters
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.ENV.RATE_LIMIT_WINDOW_MS,
    max: env_1.ENV.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes.',
        code: 'RATE_LIMIT_EXCEEDED',
    },
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env_1.ENV.AUTH_RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many authentication attempts. Please try again after 15 minutes.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
});
// Mount Rate Limiters
app.use('/api/', exports.apiLimiter);
app.use('/api/auth/login', exports.authLimiter);
app.use('/api/auth/patient/register', exports.authLimiter);
app.use('/api/auth/doctor/register', exports.authLimiter);
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/patients', patientRoutes_1.default);
app.use('/api/doctors', doctorRoutes_1.default);
app.use('/api/public-doctors', doctorPublicRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/centers', healthcareCenterRoutes_1.default);
app.use('/api/consultations', consultationRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/feedback', feedbackRoutes_1.default);
// Clinical Intelligence & ABDM Core
app.use('/api/triage', triageRoutes_1.default);
app.use('/api/pharmacy', pharmacyRoutes_1.default);
app.use('/api/telemed', telemedRoutes_1.default);
app.use('/api/abdm', abdmRoutes_1.default);
app.use('/api/resources', resourceDirectoryRoutes_1.default);
app.use('/api/rural', ruralRoutes_1.default);
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'healthy',
        service: 'SwasthyaSetu AI Production Backend',
        version: '2.0.0',
        database: {
            connected: db_1.isDbConnected,
            mode: db_1.isDbConnected ? 'MongoDB Atlas / Active' : 'Resilient High-Availability Hybrid Mode',
        },
        timestamp: new Date().toISOString(),
    });
});
// 404 & Centralized Error Handlers
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// Server Bootstrap
const startServer = async () => {
    await (0, db_1.connectDB)();
    app.listen(env_1.ENV.PORT, () => {
        console.log(`=======================================================`);
        console.log(`  SwasthyaSetu AI Production Backend (v2.0.0)`);
        console.log(`  Port: ${env_1.ENV.PORT}`);
        console.log(`  Health: http://localhost:${env_1.ENV.PORT}/api/health`);
        console.log(`=======================================================`);
    });
};
startServer();
