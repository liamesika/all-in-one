import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    const { leadId, leadInfo, answers } = await request.json();

    // Validate required fields
    if (!leadId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let qualification: any;

    // Only use OpenAI if API key is available
    if (openai) {
      // Build the qualification prompt
      const prompt = `You are an expert real estate lead qualification AI. Analyze this lead and provide a comprehensive qualification assessment.

Lead Information:
- Name: ${leadInfo.name}
- Email: ${leadInfo.email || 'Not provided'}
- Phone: ${leadInfo.phone || 'Not provided'}
- Initial Message: ${leadInfo.initialMessage || 'None'}

Qualification Answers:
${Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Please provide a qualification assessment in the following JSON format:
{
  "status": "HOT" | "WARM" | "COLD",
  "score": <number 0-100>,
  "reasoning": "<detailed analysis in 2-3 sentences explaining the classification>",
  "nextSteps": [
    "<specific action item 1>",
    "<specific action item 2>",
    "<specific action item 3>"
  ],
  "buyerProfile": {
    "budget": "<extracted budget info>",
    "timeline": "<extracted timeline>",
    "motivation": "<extracted motivation>",
    "readiness": "<assessment of readiness to buy>"
  }
}

Classification Guidelines:
- HOT (75-100): Pre-approved financing, urgent timeline (0-3 months), clear motivation, ready to view properties
- WARM (50-74): Serious intent, 3-6 month timeline, exploring options, needs some preparation
- COLD (0-49): Just browsing, unclear timeline (6+ months), no financing prep, low urgency

Be specific in your recommendations and extract actual data from the answers provided.`;

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert real estate lead qualification specialist with 20+ years of experience. You classify leads accurately and provide actionable insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      qualification = JSON.parse(content);
    } else {
      // Fallback qualification when OpenAI is not available
      qualification = {
        status: 'WARM',
        score: 60,
        reasoning: 'Lead shows interest and has provided detailed information. Recommended for follow-up within 24-48 hours to assess readiness and timeline.',
        nextSteps: [
          'Follow up within 24 hours via phone or email',
          'Ask about their budget and timeline directly',
          'Schedule a property viewing or consultation call',
          'Send property recommendations based on their requirements',
        ],
        buyerProfile: {
          budget: answers.budget || 'To be determined',
          timeline: answers.timeline || 'To be determined',
          motivation: answers.motivation || 'To be determined',
          readiness: 'Needs assessment',
        },
      };
    }

    // Return the qualification result
    return NextResponse.json(qualification);

  } catch (error) {
    console.error('Lead qualification error:', error);

    // Fallback response if OpenAI fails
    const fallbackQualification = {
      status: 'WARM',
      score: 60,
      reasoning: 'Unable to complete AI analysis at this time. This lead has been classified as WARM pending manual review. Please contact the lead directly to assess their readiness and urgency.',
      nextSteps: [
        'Follow up within 24 hours via phone or email',
        'Ask about their budget and timeline directly',
        'Schedule a property viewing or consultation call',
        'Send property recommendations based on initial inquiry',
      ],
      buyerProfile: {
        budget: 'To be determined',
        timeline: 'To be determined',
        motivation: 'To be determined',
        readiness: 'Pending assessment',
      },
    };

    return NextResponse.json(fallbackQualification);
  }
}
