import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import OpenAI from 'openai';
import { withAuth, getOwnerUid } from '@/lib/apiAuth';

const prisma = new PrismaClient();

// Initialize OpenAI only when API key is available (skip during build)
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Validation schema
const qualifyLeadSchema = z.object({
  notes: z.string().optional(),
});

// POST /api/real-estate/leads/[id]/qualify - AI qualify lead and recommend properties
export const POST = withAuth(async (request, { user, params }) => {
  try {
    const ownerUid = getOwnerUid(user);
    const body = await request.json();

    // Validate input
    const result = qualifyLeadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }

    const { notes } = result.data;

    // Fetch lead details
    const lead = await prisma.realEstateLead.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerUid },
          { orgId: { not: null } }, // TODO: Check org membership
        ]
      },
      include: {
        property: true,
      }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Fetch agent's properties for recommendations
    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { ownerUid },
          { orgId: { not: null } }, // TODO: Check org membership
        ],
        status: 'PUBLISHED', // Only recommend published properties
      },
      take: 20, // Get top 20 to analyze
      orderBy: { createdAt: 'desc' },
    });

    // Build prompt for OpenAI
    const prompt = `You are a real estate AI assistant helping to qualify a lead and recommend properties.

Lead Information:
- Name: ${lead.fullName || 'Not provided'}
- Phone: ${lead.phone || 'Not provided'}
- Email: ${lead.email || 'Not provided'}
- Message: ${lead.message || 'Not provided'}
- Source: ${lead.source || 'Not provided'}
${notes ? `- Additional Notes: ${notes}` : ''}

Available Properties (${properties.length} total):
${properties.map((p, i) => `${i + 1}. ${p.name} - ${p.transactionType} - ${p.city || 'Unknown location'} - ${p.rooms || '?'} rooms - ${p.price ? `₪${p.price.toLocaleString()}` : 'Price not set'}`).join('\n')}

Tasks:
1. Analyze the lead based on the information provided and identify:
   - Lead quality and potential
   - Budget estimation (if any indicators)
   - Property preferences (size, location, type)
   - Urgency level
   - Key concerns or requirements

2. Recommend 3-5 properties from the list that would be the best match for this lead. Consider:
   - Transaction type preference (if mentioned)
   - Location preferences
   - Budget indicators
   - Property characteristics mentioned in the message

Please respond in the following JSON format:
{
  "insights": "Detailed analysis of the lead (2-3 paragraphs)",
  "recommendedPropertyIds": ["property-id-1", "property-id-2", "property-id-3"]
}`;

    // Call OpenAI
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional real estate AI assistant. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(aiResponse);
    const insights = parsed.insights || 'Unable to analyze lead at this time.';
    const recommendedIds = parsed.recommendedPropertyIds || [];

    // Get full property details for recommendations
    const recommendedProperties = properties.filter((p) =>
      recommendedIds.includes(p.id)
    );

    // Create event
    await prisma.realEstateLeadEvent.create({
      data: {
        leadId: params.id,
        type: 'QUALIFIED',
        payload: {
          insights,
          recommendedCount: recommendedProperties.length,
          aiModel: 'gpt-4o-mini',
        },
      },
    });

    console.log('[Qualify Lead API] Qualified lead:', params.id, 'Recommendations:', recommendedProperties.length);

    return NextResponse.json({
      insights,
      recommendedProperties: recommendedProperties.map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        city: p.city,
        neighborhood: p.neighborhood,
        transactionType: p.transactionType,
        price: p.price,
        rooms: p.rooms,
      })),
    });

  } catch (error: any) {
    console.error('[Qualify Lead API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to qualify lead', details: error.message },
      { status: 500 }
    );
  }
});
