import { Injectable } from '@nestjs/common';
import { prisma } from '../../../../../packages/server/db/client';

export type CalendarEventType = 'property_viewing' | 'task_due' | 'follow_up' | 'deadline';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string; // ISO date
  status?: string;
  propertyId?: string;
  propertyName?: string;
  leadId?: string;
  leadName?: string;
  notes?: string;
}

export interface CalendarEventsQuery {
  startDate: string;
  endDate: string;
  eventTypes?: string; // Comma-separated
}

@Injectable()
export class RealEstateCalendarService {
  /**
   * Generate calendar events from properties and leads
   * - property_viewing: Recent leads on properties
   * - follow_up: Leads needing follow-up (NEW or CONTACTED status)
   * - deadline: Properties with recent updates (simulated expiration)
   * - task_due: Properties updated recently (simulated tasks)
   */
  async getEvents(ownerUid: string, query: CalendarEventsQuery): Promise<CalendarEvent[]> {
    const { startDate, endDate, eventTypes } = query;

    // Parse event types filter
    const requestedTypes = eventTypes
      ? eventTypes.split(',').map((t) => t.trim())
      : ['property_viewing', 'task_due', 'follow_up', 'deadline'];

    const events: CalendarEvent[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date range');
    }

    // Generate property_viewing events: Recent leads with property association
    if (requestedTypes.includes('property_viewing')) {
      const leads = await prisma.realEstateLead.findMany({
        where: {
          ownerUid,
          propertyId: { not: null },
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          property: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      for (const lead of leads) {
        // Schedule viewing 2 days after lead creation
        const viewingDate = new Date(lead.createdAt);
        viewingDate.setDate(viewingDate.getDate() + 2);

        if (viewingDate >= start && viewingDate <= end) {
          events.push({
            id: `viewing-${lead.id}`,
            title: `Property Viewing: ${lead.property?.name || 'Property'}`,
            type: 'property_viewing',
            date: viewingDate.toISOString(),
            status: 'scheduled',
            propertyId: lead.propertyId || undefined,
            propertyName: lead.property?.name || undefined,
            leadId: lead.id,
            leadName: lead.fullName || 'Unknown',
            notes: `Viewing scheduled for ${lead.fullName || 'lead'}`,
          });
        }
      }
    }

    // Generate follow_up events: Leads in NEW or CONTACTED status
    if (requestedTypes.includes('follow_up')) {
      const leadsNeedingFollowup = await prisma.realEstateLead.findMany({
        where: {
          ownerUid,
          // Note: RealEstateLead doesn't have a status field in current schema
          // We'll use updatedAt as a proxy for follow-up timing
          updatedAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          property: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      });

      for (const lead of leadsNeedingFollowup) {
        // Schedule follow-up 1 day after last update
        const followUpDate = new Date(lead.updatedAt);
        followUpDate.setDate(followUpDate.getDate() + 1);

        if (followUpDate >= start && followUpDate <= end) {
          events.push({
            id: `followup-${lead.id}`,
            title: `Follow up with ${lead.fullName || 'Lead'}`,
            type: 'follow_up',
            date: followUpDate.toISOString(),
            status: 'pending',
            leadId: lead.id,
            leadName: lead.fullName || 'Unknown',
            propertyId: lead.propertyId || undefined,
            propertyName: lead.property?.name || undefined,
            notes: `Follow up required for ${lead.fullName || 'lead'}`,
          });
        }
      }
    }

    // Generate deadline events: Properties with recent updates (simulated listing expiration)
    if (requestedTypes.includes('deadline')) {
      const properties = await prisma.property.findMany({
        where: {
          ownerUid,
          status: 'PUBLISHED',
          updatedAt: {
            gte: new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000), // Look back 30 days
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      });

      for (const property of properties) {
        // Simulate deadline: 30 days after last update
        const deadlineDate = new Date(property.updatedAt);
        deadlineDate.setDate(deadlineDate.getDate() + 30);

        if (deadlineDate >= start && deadlineDate <= end) {
          events.push({
            id: `deadline-${property.id}`,
            title: `Listing Renewal Due: ${property.name}`,
            type: 'deadline',
            date: deadlineDate.toISOString(),
            status: 'upcoming',
            propertyId: property.id,
            propertyName: property.name,
            notes: `Listing for ${property.name} needs renewal`,
          });
        }
      }
    }

    // Generate task_due events: Properties with follow-up tasks (based on updatedAt)
    if (requestedTypes.includes('task_due')) {
      const propertiesWithTasks = await prisma.property.findMany({
        where: {
          ownerUid,
          status: { in: ['DRAFT', 'PUBLISHED'] },
          updatedAt: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 30,
      });

      for (const property of propertiesWithTasks) {
        // Schedule task 3 days after property update
        const taskDate = new Date(property.updatedAt);
        taskDate.setDate(taskDate.getDate() + 3);

        if (taskDate >= start && taskDate <= end) {
          events.push({
            id: `task-${property.id}`,
            title: `Task Due: Update ${property.name}`,
            type: 'task_due',
            date: taskDate.toISOString(),
            status: property.status === 'DRAFT' ? 'pending' : 'in_progress',
            propertyId: property.id,
            propertyName: property.name,
            notes: `Task to update property details for ${property.name}`,
          });
        }
      }
    }

    // Sort events by date ascending
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return events;
  }
}
