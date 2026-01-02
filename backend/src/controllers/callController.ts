import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { emitToAll } from '../services/socketService';

export const getCalls = async (req: Request, res: Response) => {
    try {
        const userRole = req.user?.role;
        const username = req.user?.username;
        
        let whereClause = {};
        if (userRole === 'ENGINEER') {
            whereClause = {
                OR: [
                    { createdBy: username },
                    { assignedTo: username }
                ]
            };
        }
        
        const findArgs: any = {};
        if (Object.keys(whereClause).length > 0) findArgs.where = whereClause;
        const calls = await prisma.call.findMany(findArgs);
        res.json(calls);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch calls', details: String(err) });
    }
};

export const createCall = async (req: Request, res: Response) => {
    const { customerName, phone, email, address, problem, category, assignedTo, engineerRemark, createdBy } = req.body as {
        customerName: string;
        phone: string;
        email?: string;
        address?: string;
        problem: string;
        category: string;
        assignedTo?: string;
        engineerRemark?: string;
        createdBy?: string;
    };

    if (!customerName || !phone || !problem || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        let customer = null;
        if (phone) {
            customer = await prisma.customer.findUnique({ where: { phone } });
            
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
        }

        const [call] = await prisma.$transaction([
            prisma.call.create({
                data: {
                    customerName,
                    phone,
                    email: email || null,
                    address: address || null,
                    problem,
                    category,
                    status: assignedTo ? 'ASSIGNED' : 'PENDING',
                    assignedTo: assignedTo || null,
                    assignedAt: assignedTo ? new Date() : null,
                    assignedBy: assignedTo ? (req.user?.username || 'system') : null,
                    engineerRemark: engineerRemark || null,
                    createdBy: req.user?.username || createdBy || 'system',
                    customerId: customer?.id || null,
                }
            }),
            customer ? prisma.customer.update({
                where: { id: customer.id },
                data: {
                    outsideCalls: { increment: 1 },
                    totalInteractions: { increment: 1 },
                    lastCallDate: new Date(),
                    lastActivityDate: new Date()
                }
            }) : prisma.$queryRaw`SELECT 1`
        ]);
        
        emitToAll('call_created', call);
        res.status(201).json(call);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to create call' });
    }
};

export const updateCall = async (req: Request, res: Response) => {
    const callId = parseInt(req.params.id || '');
    if (isNaN(callId)) {
        return res.status(400).json({ error: 'Invalid call ID' });
    }

    try {
        const existingCall = await prisma.call.findUnique({ where: { id: callId } });
        if (!existingCall) {
            return res.status(404).json({ error: 'Call not found' });
        }
        if (existingCall.status === 'COMPLETED') {
            return res.status(400).json({ error: 'Cannot edit completed calls' });
        }

        const { problem, category, status, assignedTo, customerName, phone, email, address } = req.body as {
            problem: string;
            category: string;
            status?: string;
            assignedTo?: string;
            customerName: string;
            phone: string;
            email?: string;
            address?: string;
        };

        const updateData: any = {
            customerName,
            phone,
            email: email || null,
            address: address || null,
            problem,
            category,
            status: assignedTo !== undefined && assignedTo ? 'ASSIGNED' : (assignedTo === null || assignedTo === '' ? 'PENDING' : status),
        };
        
        if (assignedTo !== undefined) {
            updateData.assignedTo = assignedTo || null;
        }

        const call = await prisma.call.update({
            where: { id: callId },
            data: updateData
        });
        
        emitToAll('call_updated', call);
        res.json(call);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update call' });
    }
};

export const assignCall = async (req: Request, res: Response) => {
    const callId = parseInt(req.params.id || '');
    const { assignee, engineerRemark } = req.body as { assignee: string; engineerRemark?: string };
    
    if (!assignee) {
        return res.status(400).json({ error: 'Assignee is required' });
    }
    
    try {
        const existingCall = await prisma.call.findUnique({ where: { id: callId } });
        
        if (!existingCall) {
            return res.status(404).json({ error: 'Call not found' });
        }
        
        if (existingCall.status === 'COMPLETED') {
            return res.status(400).json({ error: 'Cannot assign a completed call' });
        }

        const updateData = {
            assignedTo: assignee,
            assignedAt: new Date(),
            assignedBy: req.user?.username || 'system',
            status: 'ASSIGNED',
            engineerRemark: engineerRemark || null
        };

        const call = await prisma.call.update({
            where: { id: callId },
            data: updateData,
            include: { customer: true }
        });
        
        emitToAll('call_assigned', call);
        res.json(call);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to assign call' });
    }
};

export const completeCall = async (req: Request, res: Response) => {
    const callId = parseInt(req.params.id || '');
    const { remark, engineerRemark } = req.body as { remark?: string; engineerRemark?: string };
    const user = req.user;
    
    try {
        const call = await prisma.call.findUnique({ where: { id: callId } });
        if (!call) {
            return res.status(404).json({ error: 'Call not found' });
        }
        
        const canComplete = call.assignedTo === user?.username || ['HOST', 'ADMIN'].includes(user?.role || '');
        if (!canComplete) {
            return res.status(403).json({ error: 'Cannot complete this call' });
        }
        
        const updatedCall = await prisma.call.update({
            where: { id: callId },
            data: {
                status: 'COMPLETED',
                completedBy: user?.username || 'system',
                completedAt: new Date(),
                remark: remark || null,
                engineerRemark: engineerRemark !== undefined ? engineerRemark : call.engineerRemark
            },
            include: { customer: true }
        });
        
        emitToAll('call_completed', updatedCall);
        res.json(updatedCall);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to complete call' });
    }
};

export const checkDuplicateCall = async (req: Request, res: Response) => {
    const { phone, category } = req.body as { phone: string; category: string };
    
    if (!phone || !category) {
        return res.status(400).json({ error: 'Phone and category are required' });
    }
    
    try {
        const existingCall = await prisma.call.findFirst({
            where: {
                phone,
                category,
                status: { in: ['PENDING', 'ASSIGNED'] }
            },
            select: {
                id: true,
                customerName: true,
                phone: true,
                category: true,
                problem: true,
                status: true,
                assignedTo: true,
                createdAt: true,
                createdBy: true,
                callCount: true
            }
        });
        
        res.json({ duplicate: !!existingCall, existingCall });
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};

export const incrementCallCount = async (req: Request, res: Response) => {
    const callId = parseInt(req.params.id || '');
    const user = req.user;
    
    try {
        const call = await prisma.call.findUnique({ where: { id: callId } });
        if (!call) {
            return res.status(404).json({ error: 'Call not found' });
        }
        
        const updatedCall = await prisma.call.update({
            where: { id: callId },
            data: {
                callCount: call.callCount + 1,
                lastCalledAt: new Date()
            }
        });
        
        emitToAll('call_updated', updatedCall);
        
        // Create notifications
        const notifications = [];
        
        if (call.createdBy && call.createdBy !== user?.username) {
            notifications.push({
                userId: call.createdBy,
                message: `Customer: ${call.customerName} (${call.phone}) called again about: ${call.category}`,
                type: 'DUPLICATE_CALL',
                callId: call.id
            });
        }
        
        if (call.assignedTo && call.assignedTo !== user?.username) {
            notifications.push({
                userId: call.assignedTo,
                message: `Customer: ${call.customerName} (${call.phone}) called again about: ${call.category}`,
                type: 'DUPLICATE_CALL',
                callId: call.id
            });
        }
        
        const admins = await prisma.user.findMany({
            where: { role: { in: ['HOST', 'ADMIN'] } },
            select: { username: true }
        });
        
        admins.forEach(admin => {
            if (admin.username !== user?.username) {
                notifications.push({
                    userId: admin.username,
                    message: `Repeat call: ${call.customerName} (${call.phone}) - ${call.category}`,
                    type: 'DUPLICATE_CALL',
                    callId: call.id
                });
            }
        });
        
        if (notifications.length > 0) {
            await prisma.notification.createMany({ data: notifications });
            notifications.forEach(notification => {
                emitToAll('notification_created', notification);
            });
        }
        
        res.json(updatedCall);
    } catch (err: any) {
        res.status(500).json({ error: String(err) });
    }
};