import { emailTemplates, renderTemplate } from '@/lib/automation/emailTemplates';

describe('Email Templates', () => {
  it('renders listing update template correctly', () => {
    const template = emailTemplates.find(t => t.id === 'listing-update');
    expect(template).toBeDefined();
    
    const data = {
      leadName: 'John Doe',
      propertyName: 'Luxury Villa',
      price: '2500000',
      address: 'Tel Aviv',
      rooms: '4',
      size: '180',
      description: 'Beautiful property',
      propertyLink: 'https://example.com/property/1',
      agentName: 'Agent Smith'
    };
    
    const rendered = renderTemplate(template!, data);
    expect(rendered.subject).toContain('Luxury Villa');
    expect(rendered.body).toContain('John Doe');
    expect(rendered.body).toContain('2500000');
  });

  it('handles missing variables gracefully', () => {
    const template = emailTemplates.find(t => t.id === 'follow-up');
    const data = { leadName: 'Jane Doe' };
    
    const rendered = renderTemplate(template!, data);
    expect(rendered.body).toContain('Jane Doe');
    expect(rendered.body).toContain('{area}');
  });

  it('replaces all occurrences of variables', () => {
    const template = {
      id: 'test',
      name: 'Test',
      subject: '{name} {name}',
      body: '{name} appears {name} twice',
      variables: ['name']
    };
    
    const rendered = renderTemplate(template, { name: 'Test' });
    expect(rendered.subject).toBe('Test Test');
    expect(rendered.body).toBe('Test appears Test twice');
  });
});
