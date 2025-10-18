export type CalendarEventType = 'property_viewing' | 'task_due' | 'follow_up' | 'deadline';

export class CalendarEventDto {
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
