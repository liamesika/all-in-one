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

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  caseId?: string;
  context?: {
    jurisdiction?: string;
    caseType?: string;
    relevantDocs?: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as ChatRequest;
    const { messages, context } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Build system message with context
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are an expert legal research assistant with deep knowledge of law across multiple jurisdictions. Your role is to:

1. **Legal Research**: Provide accurate legal research, case law analysis, and statutory interpretation
2. **Case Strategy**: Help attorneys develop case strategies and identify legal issues
3. **Document Review**: Analyze legal documents and identify key provisions
4. **Legal Writing**: Assist with drafting and reviewing legal documents
5. **Precedent Search**: Find relevant case law and precedents

${context?.jurisdiction ? `\nJurisdiction: ${context.jurisdiction}` : ''}
${context?.caseType ? `\nCase Type: ${context.caseType}` : ''}

Guidelines:
- Always cite sources and case law when possible
- Clearly distinguish between facts and legal opinions
- Highlight risks and potential issues
- Provide practical, actionable advice
- Use professional legal terminology
- When uncertain, clearly state limitations and recommend consulting with specialists
- Always include disclaimers that this is general information, not legal advice

Format your responses in markdown with:
- **Bold** for key terms and case names
- Bullet points for lists
- ### Headings for sections
- > Blockquotes for important warnings or disclaimers

Remember: You're assisting legal professionals, not providing legal advice to clients.`,
    };

    // Combine system message with user messages
    const fullMessages: ChatMessage[] = [systemMessage, ...messages];

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: fullMessages,
      temperature: 0.3,
      max_tokens: 2000,
    });

    const assistantMessage = completion.choices[0]?.message;

    if (!assistantMessage) {
      throw new Error('No response from OpenAI');
    }

    // Log usage for analytics
    console.log('[Legal Assistant Chat] Completed for user:', currentUser.uid);
    console.log('[Legal Assistant Chat] Tokens used:', completion.usage?.total_tokens);

    return NextResponse.json({
      success: true,
      message: {
        role: 'assistant',
        content: assistantMessage.content,
      },
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error: any) {
    console.error('[POST /api/law/chat] Error:', error);

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
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
