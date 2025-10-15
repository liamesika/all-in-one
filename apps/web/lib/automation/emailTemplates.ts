// Email automation templates for Real Estate
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'listing-update',
    name: 'New Listing Update',
    subject: 'New Property Match: {propertyName}',
    body: 'Hi {leadName},\n\nWe found a property that matches your criteria!\n\n{propertyName} - ₪{price}\n📍 {address}\n🏠 {rooms} rooms, {size} sqm\n\n{description}\n\nView full details: {propertyLink}\n\nBest regards,\n{agentName}',
    variables: ['leadName', 'propertyName', 'price', 'address', 'rooms', 'size', 'description', 'propertyLink', 'agentName']
  },
  {
    id: 'follow-up',
    name: 'Lead Follow-up',
    subject: 'Following up on your property search',
    body: 'Hi {leadName},\n\nI wanted to follow up on your interest in finding a property in {area}.\n\nAre you still looking? I have some new listings that might interest you.\n\nLet me know if you would like to schedule a viewing.\n\nBest regards,\n{agentName}\n{phone}',
    variables: ['leadName', 'area', 'agentName', 'phone']
  },
  {
    id: 'viewing-confirmation',
    name: 'Viewing Confirmation',
    subject: 'Property Viewing Confirmed - {propertyName}',
    body: 'Hi {leadName},\n\nYour property viewing is confirmed!\n\n📅 Date: {date}\n🕐 Time: {time}\n📍 Address: {address}\n\n{propertyName}\n\nPlease arrive 5 minutes early. Looking forward to showing you this property!\n\nBest regards,\n{agentName}\n{phone}',
    variables: ['leadName', 'propertyName', 'date', 'time', 'address', 'agentName', 'phone']
  }
];

export function renderTemplate(template: EmailTemplate, data: Record<string, string>): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;

  template.variables.forEach(variable => {
    const value = data[variable] || '{' + variable + '}';
    const regex = new RegExp('\\{' + variable + '\\}', 'g');
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  });

  return { subject, body };
}
