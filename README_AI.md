# AI Configuration & Language Detection Policy

## Overview

The EFFINITY Real Estate platform uses AI to provide intelligent property recommendations, lead qualification, and market insights. All AI interactions follow a strict language detection and response policy.

## ⚠️ CRITICAL: Language Policy

### UI & Code Language Rules
- **All UI text, code, and documentation**: English only
- **i18n JSON files**: Support both English (en) and Hebrew (he)
- **AI Responses**: Auto-detected based on user input language
- **Never mix EN/HE in UI**: All strings must come from i18n JSONs

### AI Language Detection Rules
1. **Hebrew Input** (≥70% Hebrew characters) → AI responds in Hebrew (RTL layout)
2. **English/Other Input** → AI responds in English (LTR layout)
3. **Detection Logic**: Uses language detection utility at `apps/web/lib/languageDetection.ts`
4. **Override**: Manual language toggle available for user preference

## Model Information

**Current Model**: OpenAI GPT-4o (gpt-4o)

**Version**: Latest stable release
**Provider**: OpenAI
**Capabilities**:
- Text understanding and generation
- Context-aware responses
- Multi-language support (English/Hebrew)
- Real-time conversation

## Configuration

### Environment Variables

The AI model is configured via environment variables:

```bash
OPENAI_API_KEY=sk-...your-key-here
OPENAI_MODEL=gpt-4o  # Default model
```

**Location**: `.env.local` (development) or Vercel Environment Variables (production)

### Server Route

**API Endpoint**: `/api/real-estate/ai-advisor`

**File Location**: `apps/web/app/api/real-estate/ai-advisor/route.ts`

**Configuration Code**:
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const completion = await openai.chat.completions.create({
  model: process.env.OPENAI_MODEL || 'gpt-4o',
  messages: [...],
  temperature: 0.7,
  max_tokens: 500,
});
```

## Language Detection

The AI Advisor features automatic language detection:

**Detection Logic**: `apps/web/lib/languageDetection.ts`

**Algorithm**:
- Analyzes Hebrew (Unicode 0x0590-0x05FF) vs English characters
- Hebrew ratio ≥ 70% → Responds in Hebrew (RTL)
- Otherwise → Responds in English (LTR)
- Manual override available via language toggle

**System Prompt Injection**:
```typescript
const languageInstruction = getLanguageInstruction(locale);
// Injected into system prompt to enforce language
```

## AI Features & Endpoints

### 1. AI Advisor (Property Recommendations)
- **Route**: `POST /api/real-estate/ai-advisor`
- **Model**: GPT-4o
- **Input**: User query + agent's property inventory + transaction type context
- **Output**:
  - Conversational response in detected language
  - 3-5 recommended properties from agent inventory
  - Awareness of Sale vs. Rent transaction type
- **Rate Limiting**: 60 requests per minute per user

### 2. Lead Qualification & Analysis
- **Route**: `POST /api/real-estate/qualify-lead`
- **Model**: GPT-4o
- **Input**: Lead information + optional notes + agent inventory
- **Output**:
  - Qualification score (0-100)
  - Insights about lead quality and intent
  - 3-5 recommended properties matching lead criteria
  - Transaction type awareness (Sale/Rent)
- **Rate Limiting**: 20 requests per minute

### 3. Property Ad Generator
- **Route**: `POST /api/real-estate/property-ad-generator`
- **Model**: GPT-4o
- **Input**: Property details + target platform + language preference
- **Output**:
  - Optimized ad copy in requested language
  - Platform-specific formatting (Facebook, Instagram, Google, etc.)
  - Sale vs. Rent specific language and CTAs
- **Rate Limiting**: 30 requests per minute

### Context Awareness

The AI Advisor receives page context to provide relevant suggestions:

- **Dashboard**: Lead prioritization, next actions
- **Leads**: Lead analysis, filtering recommendations, property matching
- **Properties**: Marketing suggestions, pricing analysis, scoring insights
- **Property Detail**: Market analysis, pricing suggestions, comps analysis
- **Ad Generator**: Copy optimization, photo selection, platform-specific CTAs

### Conversation History

Maintains last 5 messages for context continuity:

```typescript
conversationHistory: messages.slice(-5)
```

### Fallback Responses

Bilingual fallback responses for common queries when API unavailable:
- Lead management
- Property marketing
- Pricing strategies
- Market analysis

## Usage

### Request Format

```typescript
POST /api/real-estate/ai-advisor
Content-Type: application/json

{
  "message": "How should I prioritize my leads?",
  "context": {
    "page": "leads",
    "data": { ... }
  },
  "conversationHistory": [...],
  "conversationLocale": "en",
  "forceLocale": null
}
```

### Response Format

```typescript
{
  "message": "Focus first on hot leads with pre-approved financing...",
  "locale": "en",
  "detection": {
    "language": "en",
    "confidence": 0.95
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## Rate Limiting

**Default Limits**:
- 60 requests per minute per user
- 500 tokens max per response
- Timeout: 30 seconds

## Cost Optimization

**Strategies**:
1. Short context window (last 5 messages only)
2. Max tokens capped at 500
3. Fallback responses for common queries
4. Client-side caching of conversation history

## Model Updates

To update the model:

1. Update environment variable:
   ```bash
   OPENAI_MODEL=gpt-4-turbo-preview
   ```

2. Restart the application

3. Test with various prompts

4. Monitor costs and performance

## Monitoring

**Key Metrics**:
- Response time
- Token usage
- Error rate
- User satisfaction (implicit via continued usage)

**Logging**: All AI requests are logged (without message content) for debugging:
```typescript
console.log('[AI Advisor] Request processed', {
  locale: responseLocale,
  detectionConfidence: detection.confidence,
  timestamp: new Date().toISOString(),
});
```

## Security & Privacy

### API Key Management
- **Never expose API keys on client side**
- All AI requests go through backend API routes only
- Keys stored in environment variables: `OPENAI_API_KEY`
- Production keys use Vercel Environment Variables (Secrets)
- Principle of least privilege: API keys have minimum required permissions

### Input Sanitization
- All user input sanitized before sending to AI
- HTML/SQL injection prevention via validation middleware
- Maximum input length: 5000 characters
- Profanity filtering for public-facing content
- XSS protection: escape all user-generated content

### CSRF Protection
- All AI endpoints require authentication (Firebase UID)
- CSRF tokens on form submissions
- Origin validation on all POST requests
- Verify `ownerUid` matches authenticated user

### Rate Limiting
- Implemented per-user limits based on Firebase UID
- Different limits for different AI endpoints
- 429 response when limit exceeded
- Prevents abuse and controls costs

### Data Privacy
- No PII stored in AI request logs
- Conversation history cleared after session
- Property data limited to what user owns (ownerUid scoping)
- GDPR compliance: users can request data deletion

## Troubleshooting

### Common Issues

**1. No Response**
- Check OPENAI_API_KEY is set
- Verify API quota not exceeded
- Check network connectivity

**2. Wrong Language**
- Verify detection algorithm threshold (70%)
- Check forceLocale override
- Review system prompt injection

**3. Slow Responses**
- Monitor token usage
- Check OpenAI API status
- Verify timeout settings

## Future Enhancements

**Planned**:
- Fine-tuned model for real estate domain
- Vector search for property recommendations
- Conversation memory across sessions
- Multi-turn dialog improvements
- Voice input/output support

## References

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [GPT-4 Model Card](https://openai.com/research/gpt-4)
- Language Detection: `apps/web/lib/languageDetection.ts`
- API Route: `apps/web/app/api/real-estate/ai-advisor/route.ts`

---

**Last Updated**: January 2025
**Maintainer**: Development Team
