import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { emitToAll } from '../services/socketService';

export const getCarryInServices = async (req: Request, res: Response) => {
    try {
        const services = await prisma.carryInService.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(services);
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const createCarryInService = async (req: Request, res: Response) => {
    const { customerName, phone, email, address, category, serviceDescription } = req.body as {
        customerName: string;
        phone: string;
        email?: string;
        address?: string;
        category: string;
        serviceDescription?: string;
    };
    
    if (!customerName || !phone || !category) {
        return res.status(400).json({ error: 'Customer name, phone, and category are required' });
    }
    
    try {
        let customer = await prisma.customer.findUnique({ where: { phone } });
        if (!customer) {
            customer = await prisma.customer.create({
                data: { 
                    name: customerName, 
                    phone, 
                    email: email || null, 
                    address: address || null,
                    outsideCalls: 0,
                    carryInServices: 0,
                    totalInteractions: 0
                }
            });
        }
        
        const [service] = await prisma.$transaction([
            prisma.carryInService.create({
                data: {
                    customerName,
                    phone,
                    email: email || null,
                    address: address || null,
                    category,
                    serviceDescription: serviceDescription || null,
                    customerId: customer.id,
                    createdBy: req.user?.username || 'system'
                }
            }),
            prisma.customer.update({
                where: { id: customer.id },
                data: {
                    carryInServices: { increment: 1 },
                    totalInteractions: { increment: 1 },
                    lastServiceDate: new Date(),
                    lastActivityDate: new Date()
                }
            })
        ]);
        
        emitToAll('service_created', service);
        res.status(201).json(service);
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const completeCarryInService = async (req: Request, res: Response) => {
    const serviceId = parseInt(req.params.id || '');
    const { completeRemark } = req.body as { completeRemark?: string };
    
    if (!req.user?.username) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    try {
        const service = await prisma.carryInService.update({
            where: { id: serviceId },
            data: {
                status: 'COMPLETED_NOT_COLLECTED',
                completedBy: req.user.username,
                completedAt: new Date(),
                completeRemark: completeRemark || null
            }
        });
        
        emitToAll('service_updated', service);
        res.json(service);
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const deliverCarryInService = async (req: Request, res: Response) => {
    const serviceId = parseInt(req.params.id || '');
    const { deliverRemark } = req.body as { deliverRemark?: string };
    
    if (!req.user?.username) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    try {
        const service = await prisma.carryInService.update({
            where: { id: serviceId },
            data: {
                status: 'COMPLETED_AND_COLLECTED',
                deliveredBy: req.user.username,
                deliveredAt: new Date(),
                deliverRemark: deliverRemark || null
            }
        });
        
        emitToAll('service_updated', service);
        res.json(service);
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};