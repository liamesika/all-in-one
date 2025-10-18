import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'project_deadline' | 'task_due' | 'review_requested' | 'render_milestone';
  date: Date;
  status?: string;
  projectId?: string;
  projectName?: string;
  metadata?: any;
}

@Injectable()
export class CreativeCalendarService {
  private readonly logger = new Logger(CreativeCalendarService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all calendar events for Productions vertical
   * Aggregates from: Projects (deadlines), Tasks (due dates), Reviews, Renders
   */
  async getEvents(
    orgId: string,
    ownerUid: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      projectId?: string;
      eventTypes?: string[];
    },
  ): Promise<CalendarEvent[]> {
    this.logger.log(`Fetching calendar events for org ${orgId}`);

    const events: CalendarEvent[] = [];

    // 1. Project Deadlines
    if (!filters?.eventTypes || filters.eventTypes.includes('project_deadline')) {
      const projects = await this.prisma.creativeProject.findMany({
        where: {
          orgId,
          ownerUid,
          dueDate: {
            not: null,
            ...(filters?.startDate && { gte: filters.startDate }),
            ...(filters?.endDate && { lte: filters.endDate }),
          },
          ...(filters?.projectId && { id: filters.projectId }),
        },
        select: {
          id: true,
          name: true,
          dueDate: true,
          status: true,
        },
      });

      events.push(
        ...projects.map((p) => ({
          id: `project-${p.id}`,
          title: `${p.name} (Deadline)`,
          type: 'project_deadline' as const,
          date: p.dueDate!,
          status: p.status,
          projectId: p.id,
          projectName: p.name,
          metadata: { status: p.status },
        })),
      );
    }

    // 2. Task Due Dates
    if (!filters?.eventTypes || filters.eventTypes.includes('task_due')) {
      const tasks = await this.prisma.creativeTask.findMany({
        where: {
          project: {
            orgId,
            ownerUid,
            ...(filters?.projectId && { id: filters.projectId }),
          },
          dueAt: {
            not: null,
            ...(filters?.startDate && { gte: filters.startDate }),
            ...(filters?.endDate && { lte: filters.endDate }),
          },
        },
        select: {
          id: true,
          title: true,
          dueAt: true,
          status: true,
          projectId: true,
          project: {
            select: {
              name: true,
            },
          },
        },
      });

      events.push(
        ...tasks.map((t) => ({
          id: `task-${t.id}`,
          title: `${t.title}`,
          type: 'task_due' as const,
          date: t.dueAt!,
          status: t.status,
          projectId: t.projectId,
          projectName: t.project.name,
          metadata: { status: t.status, taskId: t.id },
        })),
      );
    }

    // 3. Review Requests
    if (!filters?.eventTypes || filters.eventTypes.includes('review_requested')) {
      const reviews = await this.prisma.creativeReview.findMany({
        where: {
          project: {
            orgId,
            ownerUid,
            ...(filters?.projectId && { id: filters.projectId }),
          },
          requestedAt: {
            ...(filters?.startDate && { gte: filters.startDate }),
            ...(filters?.endDate && { lte: filters.endDate }),
          },
        },
        select: {
          id: true,
          requestedAt: true,
          decidedAt: true,
          status: true,
          projectId: true,
          project: {
            select: {
              name: true,
            },
          },
        },
      });

      events.push(
        ...reviews.map((r) => ({
          id: `review-${r.id}`,
          title: `Review: ${r.project.name}`,
          type: 'review_requested' as const,
          date: r.requestedAt,
          status: r.status,
          projectId: r.projectId,
          projectName: r.project.name,
          metadata: { status: r.status, decidedAt: r.decidedAt },
        })),
      );
    }

    // 4. Render Milestones (QUEUED, RENDERING, READY)
    if (!filters?.eventTypes || filters.eventTypes.includes('render_milestone')) {
      const renders = await this.prisma.creativeRender.findMany({
        where: {
          project: {
            orgId,
            ownerUid,
            ...(filters?.projectId && { id: filters.projectId }),
          },
          createdAt: {
            ...(filters?.startDate && { gte: filters.startDate }),
            ...(filters?.endDate && { lte: filters.endDate }),
          },
        },
        select: {
          id: true,
          format: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          projectId: true,
          project: {
            select: {
              name: true,
            },
          },
        },
      });

      events.push(
        ...renders.map((r) => ({
          id: `render-${r.id}`,
          title: `Render (${r.format}): ${r.project.name}`,
          type: 'render_milestone' as const,
          date: r.updatedAt,
          status: r.status,
          projectId: r.projectId,
          projectName: r.project.name,
          metadata: { status: r.status, format: r.format },
        })),
      );
    }

    // Sort all events by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return events;
  }

  /**
   * Get calendar summary (counts by type)
   */
  async getSummary(
    orgId: string,
    ownerUid: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const events = await this.getEvents(orgId, ownerUid, filters);

    const summary = {
      totalEvents: events.length,
      byType: {
        project_deadline: events.filter((e) => e.type === 'project_deadline').length,
        task_due: events.filter((e) => e.type === 'task_due').length,
        review_requested: events.filter((e) => e.type === 'review_requested').length,
        render_milestone: events.filter((e) => e.type === 'render_milestone').length,
      },
      upcomingDeadlines: events
        .filter(
          (e) =>
            e.type === 'project_deadline' &&
            e.date >= new Date() &&
            e.date <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        )
        .length,
    };

    return summary;
  }
}
