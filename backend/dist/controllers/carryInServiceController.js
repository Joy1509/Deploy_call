"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerByPhone = exports.deliverCarryInService = exports.completeCarryInService = exports.createCarryInService = exports.getCarryInServices = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
const getCarryInServices = async (req, res) => {
    try {
        const services = await prisma.carryInService.findMany({
            include: {
                customer: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(services);
    }
    catch (error) {
        throw new errors_1.AppError('Failed to fetch carry-in services', 500);
    }
};
exports.getCarryInServices = getCarryInServices;
const createCarryInService = async (req, res) => {
    try {
        const { customerName, phone, email, address, category, serviceDescription } = req.body;
        if (!customerName || !phone || !category) {
            throw new errors_1.AppError('Customer name, phone, and category are required', 400);
        }
        // Check if customer exists, create if not
        let customer = await prisma.customer.findUnique({
            where: { phone }
        });
        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    name: customerName,
                    phone,
                    email,
                    address,
                    lastActivityDate: new Date()
                }
            });
        }
        const service = await prisma.carryInService.create({
            data: {
                customerName,
                phone,
                email,
                address,
                category,
                serviceDescription,
                customerId: customer.id,
                createdBy: req.user?.username || 'system'
            },
            include: {
                customer: true
            }
        });
        // Update customer stats
        await prisma.customer.update({
            where: { id: customer.id },
            data: {
                carryInServices: { increment: 1 },
                totalInteractions: { increment: 1 },
                lastServiceDate: new Date(),
                lastActivityDate: new Date()
            }
        });
        res.status(201).json(service);
    }
    catch (error) {
        throw new errors_1.AppError('Failed to create carry-in service', 500);
    }
};
exports.createCarryInService = createCarryInService;
const completeCarryInService = async (req, res) => {
    try {
        const { id } = req.params;
        const { completeRemark } = req.body;
        const service = await prisma.carryInService.update({
            where: { id: parseInt(id) },
            data: {
                status: 'COMPLETED',
                completedBy: req.user?.username || 'system',
                completedAt: new Date(),
                completeRemark
            },
            include: {
                customer: true
            }
        });
        res.json(service);
    }
    catch (error) {
        if (error.code === 'P2025') {
            throw new errors_1.AppError('Service not found', 404);
        }
        throw new errors_1.AppError('Failed to complete service', 500);
    }
};
exports.completeCarryInService = completeCarryInService;
const deliverCarryInService = async (req, res) => {
    try {
        const { id } = req.params;
        const { deliverRemark } = req.body;
        const service = await prisma.carryInService.update({
            where: { id: parseInt(id) },
            data: {
                status: 'DELIVERED',
                deliveredBy: req.user?.username || 'system',
                deliveredAt: new Date(),
                deliverRemark
            },
            include: {
                customer: true
            }
        });
        res.json(service);
    }
    catch (error) {
        if (error.code === 'P2025') {
            throw new errors_1.AppError('Service not found', 404);
        }
        throw new errors_1.AppError('Failed to deliver service', 500);
    }
};
exports.deliverCarryInService = deliverCarryInService;
const getCustomerByPhone = async (req, res) => {
    try {
        const { phone } = req.params;
        const customer = await prisma.customer.findUnique({
            where: { phone },
            include: {
                calls: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                services: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });
        if (!customer) {
            throw new errors_1.AppError('Customer not found', 404);
        }
        res.json(customer);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            throw error;
        }
        throw new errors_1.AppError('Failed to fetch customer', 500);
    }
};
exports.getCustomerByPhone = getCustomerByPhone;
//# sourceMappingURL=carryInServiceController.js.map