import { Request, Response } from 'express';
import DatabaseConfig from '../config/database';
import { AppError } from '../utils/errors';

const prisma = DatabaseConfig.getInstance();

export const getServiceCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    throw new AppError('Failed to fetch service categories', 500);
  }
};

export const createServiceCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      throw new AppError('Category name is required', 400);
    }

    const category = await prisma.serviceCategory.create({
      data: { name }
    });
    
    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new AppError('Service category already exists', 409);
    }
    throw new AppError('Failed to create service category', 500);
  }
};

export const updateServiceCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      throw new AppError('Category name is required', 400);
    }

    const category = await prisma.serviceCategory.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    
    res.json(category);
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new AppError('Service category not found', 404);
    }
    if (error.code === 'P2002') {
      throw new AppError('Service category already exists', 409);
    }
    throw new AppError('Failed to update service category', 500);
  }
};

export const deleteServiceCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.serviceCategory.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });
    
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new AppError('Service category not found', 404);
    }
    throw new AppError('Failed to delete service category', 500);
  }
};