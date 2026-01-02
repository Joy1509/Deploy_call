"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteServiceCategory = exports.updateServiceCategory = exports.createServiceCategory = exports.getServiceCategories = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
const getServiceCategories = async (req, res) => {
    try {
        const categories = await prisma.serviceCategory.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    }
    catch (error) {
        throw new errors_1.AppError('Failed to fetch service categories', 500);
    }
};
exports.getServiceCategories = getServiceCategories;
const createServiceCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            throw new errors_1.AppError('Category name is required', 400);
        }
        const category = await prisma.serviceCategory.create({
            data: { name }
        });
        res.status(201).json(category);
    }
    catch (error) {
        if (error.code === 'P2002') {
            throw new errors_1.AppError('Service category already exists', 409);
        }
        throw new errors_1.AppError('Failed to create service category', 500);
    }
};
exports.createServiceCategory = createServiceCategory;
const updateServiceCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            throw new errors_1.AppError('Category name is required', 400);
        }
        const category = await prisma.serviceCategory.update({
            where: { id: parseInt(id) },
            data: { name }
        });
        res.json(category);
    }
    catch (error) {
        if (error.code === 'P2025') {
            throw new errors_1.AppError('Service category not found', 404);
        }
        if (error.code === 'P2002') {
            throw new errors_1.AppError('Service category already exists', 409);
        }
        throw new errors_1.AppError('Failed to update service category', 500);
    }
};
exports.updateServiceCategory = updateServiceCategory;
const deleteServiceCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.serviceCategory.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });
        res.status(204).send();
    }
    catch (error) {
        if (error.code === 'P2025') {
            throw new errors_1.AppError('Service category not found', 404);
        }
        throw new errors_1.AppError('Failed to delete service category', 500);
    }
};
exports.deleteServiceCategory = deleteServiceCategory;
//# sourceMappingURL=serviceCategoryController.js.map