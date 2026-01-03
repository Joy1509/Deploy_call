import { prisma } from '../config/database';
import { hashPassword } from '../utils/bcrypt';
import { validatePasswordStrength } from '../utils/passwordValidation';
import { emitToAll, emitToUser, userSockets } from '../services/socketService';
export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, email: true, phone: true, role: true, createdAt: true }
        });
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
};
export const createUser = async (req, res) => {
    const { username, password, email, phone, role, secretPassword } = req.body;
    if (!username || !password || !email || !phone || !role) {
        return res.status(400).json({ error: "username, password, email, phone, and role are required" });
    }
    if (!['HOST', 'ADMIN', 'ENGINEER'].includes(role)) {
        return res.status(400).json({ error: "Invalid role. Must be HOST, ADMIN, or ENGINEER" });
    }
    try {
        const hashed = await hashPassword(password);
        const finalSecretPassword = role === 'HOST' ? (secretPassword || 'DEFAULTSECRET') : 'DEFAULTSECRET';
        const user = await prisma.user.create({
            data: { username, password: hashed, email, phone, role, secretPassword: finalSecretPassword }
        });
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt
        };
        emitToAll('user_created', userResponse);
        res.status(201).json(userResponse);
    }
    catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'Username, email, or phone already exists' });
        }
        res.status(500).json({ error: String(err) });
    }
};
export const updateUser = async (req, res) => {
    const userId = parseInt(req.params.id || '');
    const { username, password, email, phone, role, secretPassword } = req.body;
    try {
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updateData = {};
        if (username && username !== currentUser.username) {
            updateData.username = username;
        }
        if (email && email !== currentUser.email) {
            updateData.email = email;
        }
        if (phone && phone !== currentUser.phone) {
            updateData.phone = phone;
        }
        if (password) {
            const passwordValidation = validatePasswordStrength(password);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    error: 'Password does not meet requirements',
                    details: passwordValidation.errors
                });
            }
            updateData.password = await hashPassword(password);
        }
        if (role && ['HOST', 'ADMIN', 'ENGINEER'].includes(role)) {
            updateData.role = role;
            if (role === 'HOST' && currentUser.role !== 'HOST') {
                updateData.secretPassword = secretPassword;
            }
            else if (role !== 'HOST' && currentUser.role === 'HOST') {
                updateData.secretPassword = 'DEFAULTSECRET';
            }
        }
        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, username: true, email: true, phone: true, role: true, createdAt: true }
        });
        // Force logout the updated user via WebSocket
        const socketId = userSockets.get(userId);
        if (socketId) {
            emitToUser(userId, 'force_logout', { message: 'Your account has been updated. Please log in again.' });
        }
        emitToAll('user_updated', user);
        res.json(user);
    }
    catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'Username, email, or phone already exists' });
        }
        res.status(500).json({ error: String(err) });
    }
};
export const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.id || '');
    try {
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Unassign all calls assigned to this user
        const callsToUnassign = await prisma.call.findMany({
            where: { assignedTo: currentUser.username }
        });
        await prisma.call.updateMany({
            where: { assignedTo: currentUser.username },
            data: {
                assignedTo: null,
                status: 'PENDING',
                assignedAt: null,
                assignedBy: null,
                engineerRemark: null
            }
        });
        // Emit individual call updates for each unassigned call
        for (const call of callsToUnassign) {
            const updatedCall = {
                ...call,
                assignedTo: null,
                status: 'PENDING',
                assignedAt: null,
                assignedBy: null,
                engineerRemark: null
            };
            emitToAll('call_updated', updatedCall);
        }
        // Force logout the user before deletion via WebSocket
        const socketId = userSockets.get(userId);
        if (socketId) {
            emitToUser(userId, 'force_logout', { message: 'Your account has been removed by an administrator.' });
        }
        await prisma.user.delete({ where: { id: userId } });
        emitToAll('user_deleted_broadcast', { id: userId, username: currentUser.username });
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
};
//# sourceMappingURL=userController.js.map