export interface LawEvent {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  eventType: string;
  location?: string;
  case?: { id: string; caseNumber: string; title: string };
  client?: { id: string; name: string; email: string };
}
