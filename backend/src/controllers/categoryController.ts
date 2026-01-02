import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { emitToAll } from '../services/socketService';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    const { name } = req.body as { name: string };
    
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
    }
    
    try {
        const existingCategory = await prisma.category.findUnique({
            where: { name: name.trim() }
        });
        
        if (existingCategory) {
            if (existingCategory.isActive) {
                return res.status(400).json({ error: 'Category already exists' });
            } else {
                const category = await prisma.category.update({
                    where: { id: existingCategory.id },
                    data: { isActive: true }
                });
                emitToAll('category_created', category);
                return res.status(201).json(category);
            }
        }
        
        const category = await prisma.category.create({
            data: { name: name.trim() }
        });
        
        emitToAll('category_created', category);
        res.status(201).json(category);
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id || '');
    const { name } = req.body as { name: string };
    
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
    }
    
    try {
        const category = await prisma.category.update({
            where: { id: categoryId },
            data: { name: name.trim() }
        });
        
        emitToAll('category_updated', category);
        res.json(category);
    } catch (err: any) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'Category already exists' });
        }
        res.status(500).json({ error: String(err) });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id || '');
    
    try {
        const category = await prisma.category.update({
            where: { id: categoryId },
            data: { isActive: false }
        });
        
        emitToAll('category_deleted', { id: categoryId });
        res.json({ success: true, category });
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const getServiceCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.serviceCategory.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const createServiceCategory = async (req: Request, res: Response) => {
    const { name } = req.body as { name: string };
    
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Service category name is required' });
    }
    
    try {
        const category = await prisma.serviceCategory.create({
            data: { name: name.trim() }
        });
        
        emitToAll('service_category_created', category);
        res.status(201).json(category);
    } catch (err: any) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'Service category already exists' });
        }
        res.status(500).json({ error: String(err) });
    }
};

export const updateServiceCategory = async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id || '');
    const { name } = req.body as { name: string };
    
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Service category name is required' });
    }
    
    try {
        const category = await prisma.serviceCategory.update({
            where: { id: categoryId },
            data: { name: name.trim() }
        });
        
        emitToAll('service_category_updated', category);
        res.json(category);
    } catch (err: any) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'Service category already exists' });
        }
        res.status(500).json({ error: String(err) });
    }
};

export const deleteServiceCategory = async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id || '');
    
    try {
        const category = await prisma.serviceCategory.update({
            where: { id: categoryId },
            data: { isActive: false }
        });
        
        emitToAll('service_category_deleted', { id: categoryId });
        res.json({ success: true, category });
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};