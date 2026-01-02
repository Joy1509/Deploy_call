import type { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(customers);
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const getCustomerByPhone = async (req: Request, res: Response) => {
    const phone = req.params.phone;
    if (!phone) return res.status(400).json({ error: 'phone is required' });
    try {
        const customer = await prisma.customer.findUnique({ where: { phone: phone as string } });
        if (!customer) return res.status(404).json({ error: 'Not found' });
        res.json(customer);
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const getCustomerAnalytics = async (req: Request, res: Response) => {
    try {
        const customers = await prisma.customer.findMany({
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                address: true,
                outsideCalls: true,
                carryInServices: true,
                totalInteractions: true,
                lastCallDate: true,
                lastServiceDate: true,
                lastActivityDate: true,
                createdAt: true
            },
            orderBy: { lastActivityDate: 'desc' }
        });
        res.json(customers);
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const getCustomerDirectory = async (req: Request, res: Response) => {
    try {
        const customers = await prisma.customer.findMany({
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                address: true,
                outsideCalls: true,
                carryInServices: true,
                totalInteractions: true,
                lastActivityDate: true,
                createdAt: true
            },
            orderBy: { lastActivityDate: 'desc' }
        });
        res.json(customers);
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};