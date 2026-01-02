"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const serviceCategoryRoutes_1 = __importDefault(require("./serviceCategoryRoutes"));
const carryInServiceRoutes_1 = __importStar(require("./carryInServiceRoutes"));
const constants_1 = require("../utils/constants");
const router = (0, express_1.Router)();
// API v1 routes
const v1Router = (0, express_1.Router)();
// Mount route modules
v1Router.use('/auth', authRoutes_1.default);
v1Router.use('/users', userRoutes_1.default);
v1Router.use('/service-categories', serviceCategoryRoutes_1.default);
v1Router.use('/carry-in-services', carryInServiceRoutes_1.default);
v1Router.use('/carry-in-customers', carryInServiceRoutes_1.customerRouter);
// Health check endpoint
v1Router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API v1 is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Mount v1 routes
router.use(constants_1.API_ROUTES.V1, v1Router);
exports.default = router;
//# sourceMappingURL=index.js.map