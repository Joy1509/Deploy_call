import { Request, Response } from 'express';
import DatabaseConfig from '../config/database';
import { AppError } from '../utils/errors';

const prisma = DatabaseConfig.getInstance();

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await DatabaseConfig.withRetry(async () => {
      return await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
    });
    res.json(categories);
  } catch (error) {
    // Return mock data when database is unavailable
    res.json([
      { id: 1, name: 'Technical Support', isActive: true },
      { id: 2, name: 'Installation', isActive: true },
      { id: 3, name: 'Maintenance', isActive: true }
    ]);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      throw new AppError('Category name is required', 400);
    }

    const category = await prisma.category.create({
      data: { name }
    });
    
    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new AppError('Category already exists', 409);
    }
    throw new AppError('Failed to create category', 500);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      throw new AppError('Category name is required', 400);
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    
    res.json(category);
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new AppError('Category not found', 404);
    }
    if (error.code === 'P2002') {
      throw new AppError('Category already exists', 409);
    }
    throw new AppError('Failed to update category', 500);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.category.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });
    
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new AppError('Category not found', 404);
    }
    throw new AppError('Failed to delete category', 500);
  }
};