/**
 * AI Prompt Builders
 * Deterministic prompt construction for AI assistants
 * All prompts support bilingual outputs (EN/HE)
 */

export interface BriefGeneratorContext {
  vertical: 'real-estate' | 'e-commerce' | 'law';
  propertyDetails?: {
    title: string;
    description: string;
    price: number;
    location: string;
    features: string[];
  };
  campaignDetails?: {
    name: string;
    objective: string;
    targetAudience: string;
    budget?: number;
  };
  targetLocale: 'EN' | 'HE';
}

export interface AdCopyContext {
  productName: string;
  description: string;
  targetAudience: string;
  tone: 'professional' | 'casual' | 'urgent' | 'friendly' | 'luxury';
  channel: 'meta' | 'google' | 'linkedin' | 'tiktok' | 'youtube';
  variantsCount: number;
  maxLength?: number;
  targetLocale: 'EN' | 'HE';
}

export interface ScriptContext {
  duration: 30 | 60 | 90;
  productName: string;
  keyMessage: string;
  targetAudience: string;
  callToAction: string;
  tone: 'professional' | 'casual' | 'urgent' | 'friendly' | 'luxury';
  targetLocale: 'EN' | 'HE';
}

export interface AutoTagContext {
  assetType: 'image' | 'video' | 'document';
  fileName: string;
  description?: string;
  existingTags?: string[];
}

export interface CutdownPlanContext {
  videoDuration: number;
  targetDurations: number[];
  description: string;
  keyMoments?: string[];
}

export class AIPromptBuilder {
  /**
   * Build prompt for Brief Generator
   */
  static buildBriefPrompt(context: BriefGeneratorContext): string {
    const { vertical, propertyDetails, campaignDetails, targetLocale } = context;

    let prompt = `Generate a comprehensive campaign brief in ${targetLocale === 'EN' ? 'English' : 'Hebrew'} for a ${vertical} marketing campaign.\n\n`;

    if (propertyDetails) {
      prompt += `Property Details:\n`;
      prompt += `- Title: ${propertyDetails.title}\n`;
      prompt += `- Description: ${propertyDetails.description}\n`;
      prompt += `- Price: $${propertyDetails.price.toLocaleString()}\n`;
      prompt += `- Location: ${propertyDetails.location}\n`;
      prompt += `- Features: ${propertyDetails.features.join(', ')}\n\n`;
    }

    if (campaignDetails) {
      prompt += `Campaign Details:\n`;
      prompt += `- Name: ${campaignDetails.name}\n`;
      prompt += `- Objective: ${campaignDetails.objective}\n`;
      prompt += `- Target Audience: ${campaignDetails.targetAudience}\n`;
      if (campaignDetails.budget) {
        prompt += `- Budget: $${campaignDetails.budget.toLocaleString()}\n`;
      }
      prompt += `\n`;
    }

    prompt += `Generate a structured brief with these sections:\n`;
    prompt += `1. Campaign Overview - What is this campaign about?\n`;
    prompt += `2. Target Audience - Demographics, interests, pain points\n`;
    prompt += `3. Key Message - Main message to communicate\n`;
    prompt += `4. Goals & KPIs - Specific, measurable objectives\n`;
    prompt += `5. Creative Direction - Visual style, tone, mood\n`;
    prompt += `6. Call to Action - What action should audience take?\n`;
    prompt += `7. Channels & Formats - Recommended platforms and formats\n`;
    prompt += `8. Timeline & Budget - Key dates and budget allocation\n\n`;

    prompt += `Provide actionable, specific recommendations based on ${vertical} industry best practices.`;

    return prompt;
  }

  /**
   * Build prompt for Ad Copy Variants
   */
  static buildAdCopyPrompt(context: AdCopyContext): string {
    const {
      productName,
      description,
      targetAudience,
      tone,
      channel,
      variantsCount,
      maxLength,
      targetLocale,
    } = context;

    const channelLimits: Record<string, { headline: number; body: number }> = {
      meta: { headline: 40, body: 125 },
      google: { headline: 30, body: 90 },
      linkedin: { headline: 70, body: 150 },
      tiktok: { headline: 100, body: 2200 },
      youtube: { headline: 100, body: 5000 },
    };

    const limits = channelLimits[channel];

    let prompt = `Generate ${variantsCount} ad copy variants in ${targetLocale === 'EN' ? 'English' : 'Hebrew'} for ${channel.toUpperCase()}.\n\n`;

    prompt += `Product: ${productName}\n`;
    prompt += `Description: ${description}\n`;
    prompt += `Target Audience: ${targetAudience}\n`;
    prompt += `Tone: ${tone}\n\n`;

    prompt += `Channel Requirements (${channel.toUpperCase()}):\n`;
    prompt += `- Headline: Max ${limits.headline} characters\n`;
    prompt += `- Body: Max ${maxLength || limits.body} characters\n\n`;

    prompt += `For each variant, provide:\n`;
    prompt += `1. Headline - Attention-grabbing, benefits-focused\n`;
    prompt += `2. Primary Text - Compelling body copy\n`;
    prompt += `3. Description - Supporting details\n`;
    prompt += `4. CTA - Clear call to action\n\n`;

    prompt += `Variants should:\n`;
    prompt += `- Test different hooks (problem/solution, social proof, urgency, benefit-driven)\n`;
    prompt += `- Use ${tone} tone consistently\n`;
    prompt += `- Stay within character limits\n`;
    prompt += `- Be optimized for ${channel} audience behavior\n`;

    return prompt;
  }

  /**
   * Build prompt for Script & Shotlist
   */
  static buildScriptPrompt(context: ScriptContext): string {
    const { duration, productName, keyMessage, targetAudience, callToAction, tone, targetLocale } =
      context;

    let prompt = `Generate a ${duration}-second video script in ${targetLocale === 'EN' ? 'English' : 'Hebrew'}.\n\n`;

    prompt += `Product: ${productName}\n`;
    prompt += `Key Message: ${keyMessage}\n`;
    prompt += `Target Audience: ${targetAudience}\n`;
    prompt += `Call to Action: ${callToAction}\n`;
    prompt += `Tone: ${tone}\n\n`;

    if (duration === 30) {
      prompt += `Script Structure (30 seconds):\n`;
      prompt += `- Hook (0-3s): Attention-grabbing opening\n`;
      prompt += `- Problem (3-10s): What problem does audience face?\n`;
      prompt += `- Solution (10-25s): How does product solve it?\n`;
      prompt += `- CTA (25-30s): Clear call to action\n\n`;
    } else if (duration === 60) {
      prompt += `Script Structure (60 seconds):\n`;
      prompt += `- Hook (0-5s): Attention-grabbing opening\n`;
      prompt += `- Introduction (5-10s): Set context\n`;
      prompt += `- Problem (10-20s): Pain points\n`;
      prompt += `- Solution (20-45s): How product solves it\n`;
      prompt += `- Social Proof (45-50s): Credibility\n`;
      prompt += `- CTA (50-60s): Clear call to action\n\n`;
    } else {
      prompt += `Script Structure (90 seconds):\n`;
      prompt += `- Hook (0-5s): Attention-grabbing opening\n`;
      prompt += `- Introduction (5-15s): Set context\n`;
      prompt += `- Problem (15-25s): Pain points\n`;
      prompt += `- Solution (25-50s): How product solves it\n`;
      prompt += `- Features & Benefits (50-70s): Key differentiators\n`;
      prompt += `- Social Proof (70-80s): Credibility\n`;
      prompt += `- CTA (80-90s): Clear call to action\n\n`;
    }

    prompt += `Include:\n`;
    prompt += `1. Voiceover script with timing\n`;
    prompt += `2. Visual suggestions for each scene\n`;
    prompt += `3. On-screen text recommendations\n`;
    prompt += `4. Shotlist with scene descriptions\n`;

    return prompt;
  }

  /**
   * Build prompt for Auto-Tagging
   */
  static buildAutoTagPrompt(context: AutoTagContext): string {
    const { assetType, fileName, description, existingTags } = context;

    let prompt = `Analyze this ${assetType} asset and generate relevant tags.\n\n`;

    prompt += `File Name: ${fileName}\n`;
    if (description) {
      prompt += `Description: ${description}\n`;
    }
    if (existingTags && existingTags.length > 0) {
      prompt += `Existing Tags: ${existingTags.join(', ')}\n`;
    }
    prompt += `\n`;

    prompt += `Generate tags for:\n`;
    prompt += `1. Content Type - What is shown (e.g., "product photo", "testimonial video", "infographic")\n`;
    prompt += `2. Subject Matter - Main topics (e.g., "real estate", "luxury home", "kitchen")\n`;
    prompt += `3. Style - Visual characteristics (e.g., "professional", "modern", "minimalist")\n`;
    prompt += `4. Usage - Suitable platforms (e.g., "instagram", "facebook", "website")\n`;
    prompt += `5. Season/Time - If applicable (e.g., "summer", "holiday", "evening")\n\n`;

    prompt += `Provide 8-12 relevant tags, prioritizing specificity and searchability.`;

    return prompt;
  }

  /**
   * Build prompt for Cutdown Plan
   */
  static buildCutdownPlanPrompt(context: CutdownPlanContext): string {
    const { videoDuration, targetDurations, description, keyMoments } = context;

    let prompt = `Create a cutdown plan for a ${videoDuration}-second video.\n\n`;

    prompt += `Video Description: ${description}\n`;
    if (keyMoments && keyMoments.length > 0) {
      prompt += `Key Moments:\n`;
      keyMoments.forEach((moment, idx) => {
        prompt += `${idx + 1}. ${moment}\n`;
      });
    }
    prompt += `\n`;

    prompt += `Target Durations: ${targetDurations.join('s, ')}s\n\n`;

    prompt += `For each target duration, provide:\n`;
    prompt += `1. Start/End timestamps to extract\n`;
    prompt += `2. Scenes to include (prioritized by impact)\n`;
    prompt += `3. Suggested transitions\n`;
    prompt += `4. Required edits (speed up, overlay text, music cues)\n`;
    prompt += `5. Platform optimization tips\n\n`;

    prompt += `Cutdowns should:\n`;
    prompt += `- Maintain narrative flow\n`;
    prompt += `- Preserve key message and CTA\n`;
    prompt += `- Be optimized for platform (e.g., 15s for Stories, 30s for Feed, 60s for YouTube)\n`;
    prompt += `- Include hook in first 3 seconds\n`;

    return prompt;
  }
}
