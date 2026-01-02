"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_js_1 = require("./app.js");
// Load environment variables
dotenv_1.default.config();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
// Start server
app_js_1.app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API v1 available at /api/v1/`);
    console.log(`🏥 Health check at /health`);
});
// Handle graceful shutdown
process.on("SIGINT", () => {
    console.log("👋 Shutting down gracefully...");
    process.exit(0);
});
process.on("SIGTERM", () => {
    console.log("👋 Shutting down gracefully...");
    process.exit(0);
});
//# sourceMappingURL=index.js.map