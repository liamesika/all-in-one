/**
 * Built-in Creative Production Templates
 * These are seeded when user first accesses templates page
 */

export interface TemplateContent {
  sections: {
    title: string;
    content: string;
    placeholder?: string;
  }[];
}

export const BUILT_IN_TEMPLATES = {
  CAMPAIGN_BRIEF: {
    title: 'Campaign Brief',
    kind: 'BRIEF' as const,
    locale: 'EN' as const,
    content: {
      sections: [
        {
          title: 'Campaign Overview',
          content: '',
          placeholder: 'What is this campaign about? What are we trying to achieve?',
        },
        {
          title: 'Target Audience',
          content: '',
          placeholder: 'Who is this campaign for? Demographics, interests, behaviors...',
        },
        {
          title: 'Key Message',
          content: '',
          placeholder: 'What is the main message we want to communicate?',
        },
        {
          title: 'Goals & KPIs',
          content: '',
          placeholder: 'What metrics will define success? (e.g., 10k views, 500 leads, 2% CTR)',
        },
        {
          title: 'Creative Direction',
          content: '',
          placeholder: 'Visual style, tone of voice, mood, references...',
        },
        {
          title: 'Call to Action',
          content: '',
          placeholder: 'What action should the audience take?',
        },
        {
          title: 'Channels & Formats',
          content: '',
          placeholder: 'Where will this run? (Instagram Story, YouTube, TikTok...)',
        },
        {
          title: 'Timeline & Budget',
          content: '',
          placeholder: 'Key dates and budget constraints',
        },
      ],
    },
  },

  SCRIPT_30: {
    title: 'Video Script - 30 seconds',
    kind: 'SCRIPT' as const,
    locale: 'EN' as const,
    content: {
      sections: [
        {
          title: 'Hook (0-3s)',
          content: '',
          placeholder: 'Attention-grabbing opening line or visual',
        },
        {
          title: 'Problem (3-10s)',
          content: '',
          placeholder: 'What problem does the audience face?',
        },
        {
          title: 'Solution (10-25s)',
          content: '',
          placeholder: 'How does your product/service solve it?',
        },
        {
          title: 'Call to Action (25-30s)',
          content: '',
          placeholder: 'What should viewers do next?',
        },
        {
          title: 'Voiceover Notes',
          content: '',
          placeholder: 'Tone, pacing, accent, gender...',
        },
      ],
    },
  },

  SCRIPT_60: {
    title: 'Video Script - 60 seconds',
    kind: 'SCRIPT' as const,
    locale: 'EN' as const,
    content: {
      sections: [
        {
          title: 'Hook (0-5s)',
          content: '',
          placeholder: 'Strong opening to stop the scroll',
        },
        {
          title: 'Introduction (5-15s)',
          content: '',
          placeholder: 'Who are you? What is this about?',
        },
        {
          title: 'Problem & Context (15-30s)',
          content: '',
          placeholder: 'Set up the problem or pain point',
        },
        {
          title: 'Solution & Benefits (30-50s)',
          content: '',
          placeholder: 'Your solution and why it works',
        },
        {
          title: 'Social Proof (50-55s)',
          content: '',
          placeholder: 'Testimonial, stat, or credibility marker',
        },
        {
          title: 'Call to Action (55-60s)',
          content: '',
          placeholder: 'Clear next step for the viewer',
        },
      ],
    },
  },

  SCRIPT_90: {
    title: 'Video Script - 90 seconds',
    kind: 'SCRIPT' as const,
    locale: 'EN' as const,
    content: {
      sections: [
        {
          title: 'Hook (0-5s)',
          content: '',
          placeholder: 'Compelling opening statement or question',
        },
        {
          title: 'Introduction (5-15s)',
          content: '',
          placeholder: 'Brand intro, what to expect',
        },
        {
          title: 'Problem (15-30s)',
          content: '',
          placeholder: 'Pain point, challenge, or need',
        },
        {
          title: 'Solution Overview (30-50s)',
          content: '',
          placeholder: 'How your product/service helps',
        },
        {
          title: 'Features & Benefits (50-70s)',
          content: '',
          placeholder: 'Key features and their benefits',
        },
        {
          title: 'Social Proof (70-80s)',
          content: '',
          placeholder: 'Testimonials, reviews, stats',
        },
        {
          title: 'Call to Action (80-90s)',
          content: '',
          placeholder: 'Strong CTA with urgency if possible',
        },
      ],
    },
  },

  SHOTLIST: {
    title: 'Shotlist Template',
    kind: 'SHOTLIST' as const,
    locale: 'EN' as const,
    content: {
      sections: [
        {
          title: 'Scene 1',
          content: '',
          placeholder: 'Shot type, location, talent, props, lighting notes...',
        },
        {
          title: 'Scene 2',
          content: '',
          placeholder: 'Shot type, location, talent, props, lighting notes...',
        },
        {
          title: 'Scene 3',
          content: '',
          placeholder: 'Shot type, location, talent, props, lighting notes...',
        },
        {
          title: 'B-Roll Shots',
          content: '',
          placeholder: 'List of additional footage needed',
        },
        {
          title: 'Equipment Needed',
          content: '',
          placeholder: 'Camera, lenses, lighting, audio gear...',
        },
        {
          title: 'Production Notes',
          content: '',
          placeholder: 'Any special requirements or considerations',
        },
      ],
    },
  },

  AD_COPY: {
    title: 'Ad Copy Template',
    kind: 'AD_COPY' as const,
    locale: 'EN' as const,
    content: {
      sections: [
        {
          title: 'Headline',
          content: '',
          placeholder: 'Attention-grabbing headline (max 40 chars for most platforms)',
        },
        {
          title: 'Primary Text',
          content: '',
          placeholder: 'Main body copy (125 chars for Meta Feed, 2200 for LinkedIn)',
        },
        {
          title: 'Description',
          content: '',
          placeholder: 'Additional context (max 155 chars)',
        },
        {
          title: 'Call to Action',
          content: '',
          placeholder: 'Button text: Learn More, Shop Now, Sign Up...',
        },
        {
          title: 'Variants',
          content: '',
          placeholder: 'A/B test variations of headline and copy',
        },
      ],
    },
  },

  UGC_BRIEF: {
    title: 'UGC Creator Brief',
    kind: 'BRIEF' as const,
    locale: 'EN' as const,
    content: {
      sections: [
        {
          title: 'Campaign Goal',
          content: '',
          placeholder: 'What are we trying to achieve with this UGC?',
        },
        {
          title: 'Product/Service Overview',
          content: '',
          placeholder: 'What is being featured? Key features and benefits',
        },
        {
          title: 'Creator Guidelines',
          content: '',
          placeholder: 'Tone, style, dos and don\'ts',
        },
        {
          title: 'Key Talking Points',
          content: '',
          placeholder: 'Must-mention features, benefits, or messages',
        },
        {
          title: 'Video Structure',
          content: '',
          placeholder: 'Hook → Problem → Solution → CTA (or your structure)',
        },
        {
          title: 'Technical Requirements',
          content: '',
          placeholder: 'Length, format (9:16 for Story, 1:1 for Feed), resolution',
        },
        {
          title: 'Usage Rights',
          content: '',
          placeholder: 'Where and how long can we use this content?',
        },
        {
          title: 'Deliverables & Deadline',
          content: '',
          placeholder: 'What you need and when',
        },
      ],
    },
  },
};
