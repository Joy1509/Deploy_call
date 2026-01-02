import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export const getCarryInServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.carryInService.findMany({
      include: {
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(services);
  } catch (error) {
    throw new AppError('Failed to fetch carry-in services', 500);
  }
};

export const createCarryInService = async (req: Request, res: Response) => {
  try {
    const { 
      customerName, 
      phone, 
      email, 
      address, 
      category, 
      serviceDescription 
    } = req.body;
    
    if (!customerName || !phone || !category) {
      throw new AppError('Customer name, phone, and category are required', 400);
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
  } catch (error) {
    throw new AppError('Failed to create carry-in service', 500);
  }
};

export const completeCarryInService = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new AppError('Service not found', 404);
    }
    throw new AppError('Failed to complete service', 500);
  }
};

export const deliverCarryInService = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new AppError('Service not found', 404);
    }
    throw new AppError('Failed to deliver service', 500);
  }
};

export const getCustomerByPhone = async (req: Request, res: Response) => {
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
      throw new AppError('Customer not found', 404);
    }
    
    res.json(customer);
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch customer', 500);
  }
};

export const getCustomerDirectory = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { lastActivityDate: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    throw new AppError('Failed to fetch customer directory', 500);
  }
};