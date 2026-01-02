import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ErrorMiddleware } from '../middleware/errorMiddleware';

export class AnalyticsController {
  public static getEngineerAnalytics = ErrorMiddleware.asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all engineers
    const engineers = await prisma.user.findMany({
      where: { role: { in: ['ENGINEER', 'ADMIN'] } },
      select: { id: true, username: true, role: true }
    });

    // Get call statistics for each engineer
    const engineerStats = await Promise.all(
      engineers.map(async (engineer) => {
        const [totalCalls, completedCalls, pendingCalls] = await Promise.all([
          prisma.call.count({
            where: {
              assignedTo: engineer.username,
              createdAt: { gte: startDate }
            }
          }),
          prisma.call.count({
            where: {
              assignedTo: engineer.username,
              status: 'COMPLETED',
              createdAt: { gte: startDate }
            }
          }),
          prisma.call.count({
            where: {
              assignedTo: engineer.username,
              status: { in: ['PENDING', 'IN_PROGRESS'] },
              createdAt: { gte: startDate }
            }
          })
        ]);

        return {
          id: engineer.id,
          username: engineer.username,
          role: engineer.role,
          totalCalls,
          completedCalls,
          pendingCalls,
          completionRate: totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0
        };
      })
    );

    res.json({
      period: `${days} days`,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      engineers: engineerStats
    });
  });
}