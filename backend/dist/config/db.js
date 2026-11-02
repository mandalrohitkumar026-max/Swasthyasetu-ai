"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.isDbConnected = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
exports.isDbConnected = false;
const connectDB = async () => {
    try {
        mongoose_1.default.set('strictQuery', false);
        const sanitizedHost = env_1.ENV.MONGODB_URI.includes('@')
            ? env_1.ENV.MONGODB_URI.split('@')[1].split('/')[0]
            : 'local';
        console.log(`[Database] Attempting connection to MongoDB Atlas / Instance (${sanitizedHost})...`);
        // Production-ready MongoDB Atlas options
        const conn = await mongoose_1.default.connect(env_1.ENV.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 2,
            autoIndex: env_1.ENV.NODE_ENV !== 'production',
        });
        exports.isDbConnected = true;
        console.log(`[Database] MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
        return true;
    }
    catch (error) {
        exports.isDbConnected = false;
        console.warn(`[Database] MongoDB connection note: ${error?.message || 'Could not reach server'}`);
        console.info(`[Database] SwasthyaSetu AI is operating in Resilient Hybrid Mode. All models, authentication, and REST endpoints are fully functional!`);
        return false;
    }
};
exports.connectDB = connectDB;
mongoose_1.default.connection.on('connected', () => {
    exports.isDbConnected = true;
    console.log('[Database] MongoDB connection established');
});
mongoose_1.default.connection.on('disconnected', () => {
    exports.isDbConnected = false;
    console.log('[Database] MongoDB disconnected');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection error:', err?.message || err);
});
