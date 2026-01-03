import { prisma } from '../config/database';
export const getEngineerAnalytics = async (req, res) => {
    const days = req.query.days;
    try {
        let dateFilter = {};
        if (days && days !== 'all') {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(days));
            dateFilter = { createdAt: { gte: daysAgo } };
        }
        const users = await prisma.user.findMany({
            where: { role: { in: ['ENGINEER', 'ADMIN'] } },
            select: { username: true }
        });
        const analytics = await Promise.all(users.map(async (user) => {
            const totalAssigned = await prisma.call.count({
                where: {
                    assignedTo: user.username,
                    ...dateFilter
                }
            });
            const completed = await prisma.call.count({
                where: {
                    assignedTo: user.username,
                    status: 'COMPLETED',
                    ...dateFilter
                }
            });
            const pending = totalAssigned - completed;
            const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;
            const completedCalls = await prisma.call.findMany({
                where: {
                    assignedTo: user.username,
                    status: 'COMPLETED',
                    assignedAt: { not: null },
                    completedAt: { not: null },
                    ...dateFilter
                },
                select: { assignedAt: true, completedAt: true }
            });
            let avgResolutionTime = 0;
            if (completedCalls.length > 0) {
                const totalTime = completedCalls.reduce((sum, call) => {
                    if (call.assignedAt && call.completedAt) {
                        return sum + (new Date(call.completedAt).getTime() - new Date(call.assignedAt).getTime());
                    }
                    return sum;
                }, 0);
                avgResolutionTime = totalTime / completedCalls.length / (1000 * 60 * 60); // Convert to hours
            }
            return {
                name: user.username,
                totalAssigned,
                completed,
                pending,
                completionRate,
                avgResolutionTime
            };
        }));
        res.json(analytics);
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
};
//# sourceMappingURL=analyticsController.js.map