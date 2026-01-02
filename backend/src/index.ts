import dotenv from "dotenv";
import { app } from "./app.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Start server
app.listen(PORT, () => {
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