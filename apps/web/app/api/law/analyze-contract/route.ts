import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

interface ContractAnalysisRequest {
  contractText: string;
  caseId?: string;
  documentId?: string;
}

interface ContractRisk {
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  recommendation: string;
  clauseReference?: string;
}

interface ContractAnalysisResponse {
  summary: string;
  keyTerms: Array<{
    term: string;
    value: string;
    importance: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
  risks: ContractRisk[];
  recommendations: string[];
  metadata: {
    documentType: string;
    parties: string[];
    effectiveDate?: string;
    expirationDate?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as ContractAnalysisRequest;
    const { contractText } = body;

    if (!contractText || contractText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Contract text is required' },
        { status: 400 }
      );
    }

    // Call OpenAI to analyze the contract
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert legal contract analyzer. Analyze the provided contract and return a comprehensive JSON response with the following structure:
{
  "summary": "Brief 2-3 sentence summary of the contract",
  "keyTerms": [
    {
      "term": "Term name (e.g., Payment Terms, Duration, Termination)",
      "value": "Specific value or clause content",
      "importance": "LOW" | "MEDIUM" | "HIGH"
    }
  ],
  "risks": [
    {
      "category": "Risk category (e.g., Financial, Liability, Compliance, IP Rights)",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "description": "Description of the risk",
      "recommendation": "How to mitigate this risk",
      "clauseReference": "Reference to specific clause if applicable"
    }
  ],
  "recommendations": [
    "Specific actionable recommendations for improving the contract"
  ],
  "metadata": {
    "documentType": "Type of contract (e.g., Service Agreement, NDA, Employment Contract)",
    "parties": ["Party names involved"],
    "effectiveDate": "YYYY-MM-DD or null",
    "expirationDate": "YYYY-MM-DD or null"
  }
}

Focus on identifying:
1. Unfavorable terms or one-sided clauses
2. Missing critical clauses (indemnification, limitation of liability, confidentiality)
3. Ambiguous language that could lead to disputes
4. Compliance issues with relevant laws
5. Financial risks (payment terms, penalties, hidden costs)
6. Intellectual property concerns
7. Termination and renewal terms

Return ONLY valid JSON, no markdown formatting.`,
        },
        {
          role: 'user',
          content: `Analyze this contract:\n\n${contractText}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const analysisText = completion.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No response from OpenAI');
    }

    const analysis: ContractAnalysisResponse = JSON.parse(analysisText);

    // Log usage for analytics
    console.log('[Contract Analysis] Completed for user:', currentUser.uid);
    console.log('[Contract Analysis] Tokens used:', completion.usage?.total_tokens);

    return NextResponse.json({
      success: true,
      analysis,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error: any) {
    console.error('[POST /api/law/analyze-contract] Error:', error);

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
      { error: 'Failed to analyze contract' },
      { status: 500 }
    );
  }
}
