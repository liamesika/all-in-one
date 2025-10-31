import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PrecedentRequest {
  caseType: string;
  jurisdiction: string;
  facts: string;
  legalIssues: string[];
  desiredOutcome?: string;
  precedentType: 'brief' | 'motion' | 'memorandum' | 'opinion_letter' | 'contract_clause';
}

interface PrecedentResponse {
  title: string;
  content: string;
  citations: Array<{
    case: string;
    citation: string;
    relevance: string;
  }>;
  sections: Array<{
    heading: string;
    content: string;
  }>;
  metadata: {
    documentType: string;
    jurisdiction: string;
    generatedAt: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as PrecedentRequest;
    const {
      caseType,
      jurisdiction,
      facts,
      legalIssues,
      desiredOutcome,
      precedentType,
    } = body;

    if (!caseType || !jurisdiction || !facts || !precedentType) {
      return NextResponse.json(
        {
          error: 'Missing required fields: caseType, jurisdiction, facts, precedentType',
        },
        { status: 400 }
      );
    }

    // Build the prompt based on precedent type
    const typeInstructions: Record<string, string> = {
      brief: 'Generate a legal brief with Statement of Facts, Issues Presented, Argument, and Conclusion sections.',
      motion: 'Generate a motion document with Introduction, Legal Standard, Argument, and Prayer for Relief sections.',
      memorandum: 'Generate a legal memorandum with Question Presented, Brief Answer, Facts, Analysis, and Conclusion sections.',
      opinion_letter: 'Generate a legal opinion letter with Introduction, Facts, Analysis, Opinion, and Disclaimers sections.',
      contract_clause: 'Generate a contract clause with clear drafting, definitions, and provisions.',
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert legal document drafter with extensive experience in ${jurisdiction} law. ${typeInstructions[precedentType]}

Return a JSON response with this exact structure:
{
  "title": "Document title",
  "content": "Full document content in markdown format",
  "citations": [
    {
      "case": "Case name",
      "citation": "Legal citation",
      "relevance": "Why this case is relevant"
    }
  ],
  "sections": [
    {
      "heading": "Section heading",
      "content": "Section content"
    }
  ],
  "metadata": {
    "documentType": "${precedentType}",
    "jurisdiction": "${jurisdiction}",
    "generatedAt": "ISO date string"
  }
}

Guidelines:
1. Use proper legal formatting and citations
2. Include relevant case law and statutory references for ${jurisdiction}
3. Use clear, professional legal language
4. Ensure all sections are complete and well-structured
5. Add [PLACEHOLDER: specific details] where party-specific information is needed
6. Include standard disclaimers and qualifications as appropriate

Return ONLY valid JSON, no markdown formatting.`,
        },
        {
          role: 'user',
          content: `Generate a ${precedentType} for the following case:

Case Type: ${caseType}
Jurisdiction: ${jurisdiction}
Legal Issues: ${legalIssues.join(', ')}
${desiredOutcome ? `Desired Outcome: ${desiredOutcome}` : ''}

Facts:
${facts}`,
        },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const precedentText = completion.choices[0]?.message?.content;

    if (!precedentText) {
      throw new Error('No response from OpenAI');
    }

    const precedent: PrecedentResponse = JSON.parse(precedentText);

    // Log usage for analytics
    console.log('[Precedent Generation] Completed for user:', currentUser.uid);
    console.log('[Precedent Generation] Tokens used:', completion.usage?.total_tokens);

    return NextResponse.json({
      success: true,
      precedent,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error: any) {
    console.error('[POST /api/law/generate-precedent] Error:', error);

    // Handle OpenAI specific errors
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'OpenAI API key is invalid or missing' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate precedent document' },
      { status: 500 }
    );
  }
}
