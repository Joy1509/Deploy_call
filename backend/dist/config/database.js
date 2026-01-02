"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
class DatabaseConfig {
    static getInstance() {
        if (!DatabaseConfig.instance) {
            DatabaseConfig.instance = new client_1.PrismaClient();
        }
        return DatabaseConfig.instance;
    }
    static async connect() {
        try {
            await DatabaseConfig.getInstance().$connect();
            console.log('Database connected successfully');
        }
        catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    }
    static async disconnect() {
        try {
            await DatabaseConfig.getInstance().$disconnect();
            console.log('Database disconnected');
        }
        catch (error) {
            console.error('Database disconnection failed:', error);
        }
    }
}
exports.prisma = DatabaseConfig.getInstance();
exports.default = DatabaseConfig;
//# sourceMappingURL=database.js.map