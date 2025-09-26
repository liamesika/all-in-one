import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import {
  ProductionAnalyticsQueryDto,
  ProductionOverviewStatsDto,
  ProjectStatusDistributionDto,
  TaskStatusDistributionDto,
  TaskDomainDistributionDto,
  BudgetCategoryBreakdownDto,
  SupplierCategoryBreakdownDto,
  TopPerformersDto,
  ProductionTimelineStatsDto,
  ProductionAnalyticsResponseDto,
  ProductionDashboardKPIDto,
} from './dto/production-analytics.dto';

@Injectable()
export class ProductionAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(
    ownerUid: string,
    organizationId: string,
    query: ProductionAnalyticsQueryDto
  ): Promise<ProductionAnalyticsResponseDto> {
    const { projectId, startDate, endDate, projectStatus, projectType } = query;

    // Set default date range (last 30 days if not specified)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const actualStartDate = startDate ? new Date(startDate) : defaultStartDate;
    const actualEndDate = endDate ? new Date(endDate) : defaultEndDate;

    // Build base where clause
    const baseWhere = {
      ownerUid,
      organizationId,
      ...(projectId && { id: projectId }),
      ...(projectStatus && { status: projectStatus }),
      ...(projectType && { type: projectType }),
      createdAt: {
        gte: actualStartDate,
        lte: actualEndDate,
      },
    };

    // Execute all analytics queries in parallel
    const [
      overview,
      projectStatusDist,
      taskStatusDist,
      taskDomainDist,
      budgetBreakdown,
      supplierBreakdown,
      topPerformers,
      timeline,
    ] = await Promise.all([
      this.getOverviewStats(ownerUid, organizationId, baseWhere),
      this.getProjectStatusDistribution(ownerUid, organizationId, baseWhere),
      this.getTaskStatusDistribution(ownerUid, organizationId, baseWhere),
      this.getTaskDomainDistribution(ownerUid, organizationId, baseWhere),
      this.getBudgetCategoryBreakdown(ownerUid, organizationId, baseWhere),
      this.getSupplierCategoryBreakdown(ownerUid, organizationId, baseWhere),
      this.getTopPerformers(ownerUid, organizationId, baseWhere),
      this.getTimelineStats(ownerUid, organizationId, actualStartDate, actualEndDate),
    ]);

    return {
      overview,
      projectStatusDistribution: projectStatusDist,
      taskStatusDistribution: taskStatusDist,
      taskDomainDistribution: taskDomainDist,
      budgetCategoryBreakdown: budgetBreakdown,
      supplierCategoryBreakdown: supplierBreakdown,
      topPerformers,
      timeline,
      generatedAt: new Date().toISOString(),
      dataRange: {
        startDate: actualStartDate.toISOString(),
        endDate: actualEndDate.toISOString(),
      },
    };
  }

  async getDashboardKPIs(
    ownerUid: string,
    organizationId: string
  ): Promise<ProductionDashboardKPIDto> {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    // Current period stats
    const [
      currentStats,
      previousStats,
      upcomingDeadlines,
      criticalTasks,
    ] = await Promise.all([
      this.getKPIStats(ownerUid, organizationId, thirtyDaysAgo, now),
      this.getKPIStats(ownerUid, organizationId, sixtyDaysAgo, thirtyDaysAgo),
      this.getUpcomingDeadlines(ownerUid, organizationId),
      this.getCriticalTasks(ownerUid, organizationId),
    ]);

    // Calculate trends
    const projectsTrend = this.calculateTrend(currentStats.totalProjects, previousStats.totalProjects);
    const taskCompletionTrend = this.calculateTrend(
      currentStats.completionRate,
      previousStats.completionRate
    );
    const budgetVarianceTrend = this.calculateTrend(
      Math.abs(currentStats.budgetVariancePercentage),
      Math.abs(previousStats.budgetVariancePercentage),
      true // Lower is better for budget variance
    );

    return {
      activeProjectsCount: currentStats.activeProjects,
      overdueTasks: currentStats.overdueTasks,
      budgetOverruns: currentStats.budgetOverruns,
      teamUtilization: currentStats.teamUtilization,
      projectsTrend,
      taskCompletionTrend,
      budgetVarianceTrend,
      upcomingDeadlines,
      criticalTasks,
    };
  }

  private async getOverviewStats(
    ownerUid: string,
    organizationId: string,
    baseWhere: any
  ): Promise<ProductionOverviewStatsDto> {
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      taskStats,
      budgetStats,
      supplierStats,
      fileStats,
      projectMetrics,
    ] = await Promise.all([
      this.prisma.productionProject.count({ where: { ...baseWhere } }),
      this.prisma.productionProject.count({ where: { ...baseWhere, status: 'ACTIVE' } }),
      this.prisma.productionProject.count({ where: { ...baseWhere, status: 'DONE' } }),
      this.prisma.productionProject.count({ where: { ...baseWhere, status: 'ON_HOLD' } }),
      this.getTaskOverviewStats(ownerUid, organizationId),
      this.getBudgetOverviewStats(ownerUid, organizationId),
      this.getSupplierOverviewStats(ownerUid, organizationId),
      this.getFileOverviewStats(ownerUid, organizationId),
      this.getProjectMetrics(ownerUid, organizationId),
    ]);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      ...taskStats,
      ...budgetStats,
      ...supplierStats,
      totalFiles: fileStats.totalFiles,
      ...projectMetrics,
    };
  }

  private async getTaskOverviewStats(ownerUid: string, organizationId: string) {
    const now = new Date();
    const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
      this.prisma.productionTask.count({ where: { ownerUid, organizationId } }),
      this.prisma.productionTask.count({ where: { ownerUid, organizationId, status: 'DONE' } }),
      this.prisma.productionTask.count({
        where: {
          ownerUid,
          organizationId,
          status: { not: 'DONE' },
          dueDate: { lt: now },
        },
      }),
    ]);

    return { totalTasks, completedTasks, overdueTasks };
  }

  private async getBudgetOverviewStats(ownerUid: string, organizationId: string) {
    const budgetItems = await this.prisma.productionBudgetItem.findMany({
      where: { ownerUid, organizationId },
      select: { planned: true, actual: true },
    });

    const totalBudgetPlanned = budgetItems.reduce((sum, item) => sum + Number(item.planned), 0);
    const totalBudgetActual = budgetItems.reduce((sum, item) => sum + Number(item.actual), 0);
    const budgetVariance = totalBudgetActual - totalBudgetPlanned;
    const budgetVariancePercentage = totalBudgetPlanned > 0 ? (budgetVariance / totalBudgetPlanned) * 100 : 0;

    return {
      totalBudgetPlanned,
      totalBudgetActual,
      budgetVariance,
      budgetVariancePercentage,
    };
  }

  private async getSupplierOverviewStats(ownerUid: string, organizationId: string) {
    const [totalSuppliers, activeSuppliers] = await Promise.all([
      this.prisma.productionSupplier.count({ where: { ownerUid, organizationId } }),
      this.prisma.productionSupplier.count({
        where: {
          ownerUid,
          organizationId,
          projects: { some: { project: { status: 'ACTIVE' } } },
        },
      }),
    ]);

    return { totalSuppliers, activeSuppliers };
  }

  private async getFileOverviewStats(ownerUid: string, organizationId: string) {
    const totalFiles = await this.prisma.productionFileAsset.count({
      where: { ownerUid, organizationId },
    });

    return { totalFiles };
  }

  private async getProjectMetrics(ownerUid: string, organizationId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [completedProjects, projectsThisMonth, tasksCompletedThisWeek] = await Promise.all([
      this.prisma.productionProject.findMany({
        where: { ownerUid, organizationId, status: 'DONE' },
        select: { startDate: true, endDate: true },
      }),
      this.prisma.productionProject.count({
        where: {
          ownerUid,
          organizationId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.productionTask.count({
        where: {
          ownerUid,
          organizationId,
          status: 'DONE',
          updatedAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    // Calculate average project duration
    const projectDurations = completedProjects
      .filter(p => p.startDate && p.endDate)
      .map(p => {
        const start = new Date(p.startDate!);
        const end = new Date(p.endDate!);
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      });

    const averageProjectDuration = projectDurations.length > 0
      ? projectDurations.reduce((sum, duration) => sum + duration, 0) / projectDurations.length
      : 0;

    return {
      averageProjectDuration,
      projectsThisMonth,
      tasksCompletedThisWeek,
    };
  }

  private async getProjectStatusDistribution(
    ownerUid: string,
    organizationId: string,
    baseWhere: any
  ): Promise<ProjectStatusDistributionDto[]> {
    const projects = await this.prisma.productionProject.groupBy({
      by: ['status'],
      where: { ...baseWhere },
      _count: { id: true },
    });

    const total = projects.reduce((sum, p) => sum + p._count.id, 0);

    return projects.map(p => ({
      status: p.status as any,
      count: p._count.id,
      percentage: total > 0 ? (p._count.id / total) * 100 : 0,
    }));
  }

  private async getTaskStatusDistribution(
    ownerUid: string,
    organizationId: string,
    baseWhere: any
  ): Promise<TaskStatusDistributionDto[]> {
    const tasks = await this.prisma.productionTask.groupBy({
      by: ['status'],
      where: { ownerUid, organizationId },
      _count: { id: true },
    });

    const total = tasks.reduce((sum, t) => sum + t._count.id, 0);

    return tasks.map(t => ({
      status: t.status as any,
      count: t._count.id,
      percentage: total > 0 ? (t._count.id / total) * 100 : 0,
    }));
  }

  private async getTaskDomainDistribution(
    ownerUid: string,
    organizationId: string,
    baseWhere: any
  ): Promise<TaskDomainDistributionDto[]> {
    const tasks = await this.prisma.productionTask.groupBy({
      by: ['domain'],
      where: { ownerUid, organizationId },
      _count: { id: true },
    });

    const total = tasks.reduce((sum, t) => sum + t._count.id, 0);

    return tasks.map(t => ({
      domain: t.domain as any,
      count: t._count.id,
      percentage: total > 0 ? (t._count.id / total) * 100 : 0,
    }));
  }

  private async getBudgetCategoryBreakdown(
    ownerUid: string,
    organizationId: string,
    baseWhere: any
  ): Promise<BudgetCategoryBreakdownDto[]> {
    const budgetItems = await this.prisma.productionBudgetItem.groupBy({
      by: ['category'],
      where: { ownerUid, organizationId },
      _count: { id: true },
      _sum: { planned: true, actual: true },
    });

    return budgetItems.map(item => {
      const plannedTotal = Number(item._sum.planned || 0);
      const actualTotal = Number(item._sum.actual || 0);
      const variance = actualTotal - plannedTotal;
      const variancePercentage = plannedTotal > 0 ? (variance / plannedTotal) * 100 : 0;

      return {
        category: item.category as any,
        plannedTotal,
        actualTotal,
        variance,
        variancePercentage,
        itemCount: item._count.id,
      };
    });
  }

  private async getSupplierCategoryBreakdown(
    ownerUid: string,
    organizationId: string,
    baseWhere: any
  ): Promise<SupplierCategoryBreakdownDto[]> {
    const suppliers = await this.prisma.productionSupplier.groupBy({
      by: ['category'],
      where: { ownerUid, organizationId },
      _count: { id: true },
      _avg: { rating: true },
    });

    // Get budget values for each supplier category
    const budgetByCategory = await this.prisma.productionBudgetItem.groupBy({
      by: ['category'],
      where: { ownerUid, organizationId },
      _sum: { planned: true },
    });

    const budgetMap = new Map(budgetByCategory.map(b => [b.category, Number(b._sum.planned || 0)]));

    return suppliers.map(supplier => ({
      category: supplier.category as any,
      count: supplier._count.id,
      averageRating: Number(supplier._avg.rating || 0),
      totalBudgetValue: budgetMap.get(supplier.category) || 0,
    }));
  }

  private async getTopPerformers(
    ownerUid: string,
    organizationId: string,
    baseWhere: any
  ): Promise<TopPerformersDto> {
    // Top task completors
    const topTaskCompletors = await this.prisma.productionTask.groupBy({
      by: ['assigneeId'],
      where: {
        ownerUid,
        organizationId,
        status: 'DONE',
        assigneeId: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const taskCompletorDetails = await Promise.all(
      topTaskCompletors.map(async (tc) => {
        const user = await this.prisma.user.findFirst({
          where: { id: tc.assigneeId! },
          select: { id: true, fullName: true },
        });

        // Calculate on-time completion rate
        const [totalTasks, allDoneTasks] = await Promise.all([
          this.prisma.productionTask.count({
            where: {
              ownerUid,
              organizationId,
              assigneeId: tc.assigneeId,
              status: 'DONE',
            },
          }),
          this.prisma.productionTask.findMany({
            where: {
              ownerUid,
              organizationId,
              assigneeId: tc.assigneeId,
              status: 'DONE',
            },
            select: { dueDate: true, updatedAt: true },
          }),
        ]);

        // Calculate on-time completion manually
        const onTimeTasks = allDoneTasks.filter(task => {
          if (!task.dueDate) return true; // Tasks without due dates are considered on-time
          return task.updatedAt <= task.dueDate;
        }).length;

        return {
          userId: tc.assigneeId!,
          userName: user?.fullName || 'Unknown',
          completedTasks: tc._count.id,
          onTimeCompletionRate: totalTasks > 0 ? (onTimeTasks / totalTasks) * 100 : 0,
        };
      })
    );

    // Top suppliers by value and most active projects omitted for brevity
    // These would follow similar patterns

    return {
      topTaskCompletors: taskCompletorDetails,
      topSuppliersByValue: [], // Implement as needed
      mostActiveProjects: [], // Implement as needed
    };
  }

  private async getTimelineStats(
    ownerUid: string,
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProductionTimelineStatsDto[]> {
    // Generate daily stats for the date range
    const timeline: ProductionTimelineStatsDto[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayStart = new Date(current);
      const dayEnd = new Date(current);
      dayEnd.setHours(23, 59, 59, 999);

      const [projectsCreated, tasksCompleted, budgetSpent] = await Promise.all([
        this.prisma.productionProject.count({
          where: {
            ownerUid,
            organizationId,
            createdAt: { gte: dayStart, lte: dayEnd },
          },
        }),
        this.prisma.productionTask.count({
          where: {
            ownerUid,
            organizationId,
            status: 'DONE',
            updatedAt: { gte: dayStart, lte: dayEnd },
          },
        }),
        this.prisma.productionBudgetItem.aggregate({
          where: {
            ownerUid,
            organizationId,
            updatedAt: { gte: dayStart, lte: dayEnd },
          },
          _sum: { actual: true },
        }),
      ]);

      timeline.push({
        date: current.toISOString().split('T')[0],
        projectsCreated,
        tasksCompleted,
        budgetSpent: Number(budgetSpent._sum.actual || 0),
      });

      current.setDate(current.getDate() + 1);
    }

    return timeline;
  }

  // Helper methods for KPI calculations

  private async getKPIStats(
    ownerUid: string,
    organizationId: string,
    startDate: Date,
    endDate: Date
  ) {
    const [projects, tasks, budgetItems] = await Promise.all([
      this.prisma.productionProject.findMany({
        where: {
          ownerUid,
          organizationId,
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { status: true },
      }),
      this.prisma.productionTask.findMany({
        where: {
          ownerUid,
          organizationId,
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { status: true, assigneeId: true, dueDate: true, updatedAt: true },
      }),
      this.prisma.productionBudgetItem.findMany({
        where: {
          ownerUid,
          organizationId,
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { planned: true, actual: true },
      }),
    ]);

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const now = new Date();
    const overdueTasks = tasks.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now).length;

    const assignedUsers = new Set(tasks.filter(t => t.assigneeId).map(t => t.assigneeId));
    const teamUtilization = assignedUsers.size; // Simplified metric

    const totalPlanned = budgetItems.reduce((sum, item) => sum + Number(item.planned), 0);
    const totalActual = budgetItems.reduce((sum, item) => sum + Number(item.actual), 0);
    const budgetVariancePercentage = totalPlanned > 0 ? ((totalActual - totalPlanned) / totalPlanned) * 100 : 0;

    const budgetOverruns = budgetItems.filter(item => Number(item.actual) > Number(item.planned)).length;

    return {
      totalProjects,
      activeProjects,
      completedTasks,
      totalTasks,
      completionRate,
      overdueTasks,
      teamUtilization,
      budgetVariancePercentage,
      budgetOverruns,
    };
  }

  private async getUpcomingDeadlines(ownerUid: string, organizationId: string) {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const upcomingTasks = await this.prisma.productionTask.findMany({
      where: {
        ownerUid,
        organizationId,
        status: { not: 'DONE' },
        dueDate: { gte: now, lte: nextWeek },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        project: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    return upcomingTasks.map(task => ({
      projectId: task.id,
      projectName: task.project.name,
      dueDate: task.dueDate!.toISOString(),
      daysUntilDue: Math.ceil((new Date(task.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }));
  }

  private async getCriticalTasks(ownerUid: string, organizationId: string) {
    const now = new Date();

    const overdueTasks = await this.prisma.productionTask.findMany({
      where: {
        ownerUid,
        organizationId,
        status: { not: 'DONE' },
        dueDate: { lt: now },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        assignee: { select: { fullName: true } },
        project: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    return overdueTasks.map(task => ({
      taskId: task.id,
      taskTitle: task.title,
      projectName: task.project.name,
      assignee: task.assignee?.fullName,
      overdueDays: Math.ceil((now.getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24)),
    }));
  }

  private calculateTrend(current: number, previous: number, lowerIsBetter = false) {
    if (previous === 0) {
      return {
        value: current,
        change: 0,
        isPositive: current >= 0,
      };
    }

    const change = ((current - previous) / previous) * 100;
    const isPositive = lowerIsBetter ? change < 0 : change > 0;

    return {
      value: current,
      change: Math.abs(change),
      isPositive,
    };
  }
}