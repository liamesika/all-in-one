/**
 * Language Detection Utility for Hebrew/English
 * Detects the primary language of user input to enable automatic language switching
 */

export type DetectedLanguage = 'he' | 'en';

interface LanguageDetectionResult {
  language: DetectedLanguage;
  confidence: number; // 0-1
  hebrewRatio: number; // Percentage of Hebrew characters
}

/**
 * Detects whether text is primarily Hebrew or English
 * @param text - Input text to analyze
 * @returns Detection result with language, confidence, and metrics
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return { language: 'en', confidence: 0, hebrewRatio: 0 };
  }

  // Remove whitespace, numbers, and punctuation for analysis
  const cleanText = text.replace(/[\s\d.,!?;:()\-–—"'״׳]/g, '');

  if (cleanText.length === 0) {
    return { language: 'en', confidence: 0, hebrewRatio: 0 };
  }

  // Count Hebrew characters (Unicode range: 0x0590-0x05FF)
  const hebrewChars = (cleanText.match(/[\u0590-\u05FF]/g) || []).length;

  // Count English characters (basic Latin alphabet)
  const englishChars = (cleanText.match(/[a-zA-Z]/g) || []).length;

  // Calculate total meaningful characters
  const totalChars = hebrewChars + englishChars;

  if (totalChars === 0) {
    return { language: 'en', confidence: 0, hebrewRatio: 0 };
  }

  // Calculate Hebrew ratio
  const hebrewRatio = hebrewChars / totalChars;

  // Decision logic: ≥70% Hebrew → Hebrew, else English
  const language: DetectedLanguage = hebrewRatio >= 0.7 ? 'he' : 'en';

  // Calculate confidence (how clear the choice is)
  // High confidence when ratio is very high or very low
  const confidence = Math.abs(hebrewRatio - 0.5) * 2; // 0-1 scale

  return {
    language,
    confidence,
    hebrewRatio,
  };
}

/**
 * Determines conversation language based on history and current message
 * @param currentMessage - Current user message
 * @param conversationLocale - Previously established conversation locale (if any)
 * @param forceLocale - Manual override locale (if user toggled)
 * @returns The locale to use for this response
 */
export function determineConversationLanguage(
  currentMessage: string,
  conversationLocale?: DetectedLanguage,
  forceLocale?: DetectedLanguage
): DetectedLanguage {
  // If user manually forced a language, always use it
  if (forceLocale) {
    return forceLocale;
  }

  // Detect current message language
  const detection = detectLanguage(currentMessage);

  // If we have a conversation locale and detection confidence is low, stick with it
  if (conversationLocale && detection.confidence < 0.6) {
    return conversationLocale;
  }

  // Otherwise use detected language
  return detection.language;
}

/**
 * Get system prompt instruction for language enforcement
 * @param locale - Target language
 * @returns System instruction for AI
 */
export function getLanguageInstruction(locale: DetectedLanguage): string {
  if (locale === 'he') {
    return 'You must respond ONLY in Hebrew (עברית). Do not mix English words or phrases. Use proper Hebrew grammar and vocabulary throughout your entire response.';
  } else {
    return 'You must respond ONLY in English. Do not mix Hebrew words or phrases. Use proper English grammar and vocabulary throughout your entire response.';
  }
}

/**
 * Validate that response matches expected language
 * @param response - AI response text
 * @param expectedLocale - Expected language
 * @returns true if response is in correct language
 */
export function validateResponseLanguage(
  response: string,
  expectedLocale: DetectedLanguage
): boolean {
  const detection = detectLanguage(response);

  // Allow some tolerance for mixed content (e.g., English property names in Hebrew text)
  if (expectedLocale === 'he') {
    return detection.hebrewRatio >= 0.6;
  } else {
    return detection.hebrewRatio <= 0.3;
  }
}
