import { withAuth, getOwnerUid } from '@/lib/apiAuth';
import { NextRequest, NextResponse } from 'next/server';

type AutoFollowupTrigger = 'NEW_LEAD' | 'HOT_LEAD' | 'FIRST_CONTACT' | 'QUALIFIED' | 'NO_RESPONSE_24H' | 'NO_RESPONSE_7D';
type AutoFollowupChannel = 'EMAIL' | 'WHATSAPP' | 'SMS';

type AutoFollowupTemplate = {
  id: string;
  name: string;
  trigger: AutoFollowupTrigger;
  channel: AutoFollowupChannel;
  subject?: string;
  content: string;
  variables?: string[];
  isActive: boolean;
  delayMinutes: number;
  brandName?: string;
  brandLogo?: string;
  brandColors?: any;
  createdAt: string;
  updatedAt: string;
  _count?: {
    followups: number;
  };
};

// Mock templates data
let mockTemplates: AutoFollowupTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email - New Leads',
    trigger: 'NEW_LEAD',
    channel: 'EMAIL',
    subject: 'Thank you for your interest, {{leadName}}!',
    content: `Hi {{leadName}},

Thank you for your interest in {{brandName}}! We're excited to help you find exactly what you're looking for.

Our team will review your inquiry and get back to you within 24 hours. In the meantime, feel free to browse our latest offerings.

Best regards,
{{brandName}} Team

P.S. Have questions? Reply to this email or call us directly!`,
    variables: ['leadName', 'brandName'],
    isActive: true,
    delayMinutes: 0,
    brandName: 'Effinity Real Estate',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    _count: {
      followups: 45
    }
  },
  {
    id: '2',
    name: 'WhatsApp Welcome Message',
    trigger: 'NEW_LEAD',
    channel: 'WHATSAPP',
    content: `Hello {{leadName}}! 👋

Thank you for your interest in {{brandName}}. We received your inquiry and will get back to you shortly.

Is there anything specific you'd like to know about our properties?`,
    variables: ['leadName', 'brandName'],
    isActive: true,
    delayMinutes: 15,
    brandName: 'Effinity Real Estate',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    _count: {
      followups: 23
    }
  },
  {
    id: '3',
    name: 'Hot Lead Special Offer',
    trigger: 'HOT_LEAD',
    channel: 'EMAIL',
    subject: 'Special offer for {{leadName}} - Limited time!',
    content: `Hi {{leadName}},

We noticed you're highly interested in our properties. As a valued prospect, we'd like to offer you a special {{discountPercent}}% discount on viewing fees!

This exclusive offer is valid for the next 48 hours only.

Ready to schedule a viewing? Reply to this email or call us at {{companyPhone}}.

Best regards,
{{brandName}} Team`,
    variables: ['leadName', 'brandName', 'discountPercent', 'companyPhone'],
    isActive: true,
    delayMinutes: 60,
    brandName: 'Effinity Real Estate',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    _count: {
      followups: 12
    }
  },
  {
    id: '4',
    name: '24h No Response Follow-up',
    trigger: 'NO_RESPONSE_24H',
    channel: 'SMS',
    content: `Hi {{leadName}}, this is {{brandName}}. We sent you some property options yesterday. Did you have a chance to review them? Let us know if you have any questions! 🏠`,
    variables: ['leadName', 'brandName'],
    isActive: false,
    delayMinutes: 1440, // 24 hours
    brandName: 'Effinity Real Estate',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    _count: {
      followups: 0
    }
  }
];

let nextId = 5;

export const GET = withAuth(async (request, { user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const ownerUid = searchParams.get('ownerUid');

    if (!ownerUid) {
      return NextResponse.json({ error: 'Owner UID is required' }, { status: 400 });
    }

    // In a real app, this would filter by ownerUid
    return NextResponse.json({
      templates: mockTemplates,
      total: mockTemplates.length
    });
  } catch (error) {
    console.error('Get templates API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withAuth(async (request, { user }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();
    const { name, trigger, channel, subject, content, isActive, delayMinutes, brandName } = body;

    if (!name || !trigger || !channel || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create new template
    const newTemplate: AutoFollowupTemplate = {
      id: nextId.toString(),
      name,
      trigger,
      channel,
      subject: channel === 'EMAIL' ? subject : undefined,
      content,
      variables: [], // Could parse variables from content
      isActive: isActive ?? true,
      delayMinutes: delayMinutes ?? 0,
      brandName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: {
        followups: 0
      }
    };

    mockTemplates.push(newTemplate);
    nextId++;

    return NextResponse.json({
      id: newTemplate.id,
      createdAt: newTemplate.createdAt,
      success: true
    });
  } catch (error: any) {
    console.error('Create template API error:', error);
    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to create template'
    }, { status: 500 });
  }
});