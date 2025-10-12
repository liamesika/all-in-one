/**
 * Property Scoring Algorithm (0-100)
 * Evaluates property quality based on pricing, market time, photos, and description
 */

interface PropertyScoreBreakdown {
  total: number;
  base: number;
  pricing: number; // 0-25 points
  marketTime: number; // 0-15 points
  photos: number; // 0-10 points
  description: number; // 0-10 points
}

interface Property {
  price?: number;
  size?: number;
  city?: string;
  createdAt?: string;
  publishedAt?: string | null;
  images?: string[];
  description?: string;
}

/**
 * Calculate comprehensive property score with breakdown
 */
export function calculatePropertyScore(
  property: Property,
  neighborhoodMedian?: { city: string; pricePerSqm: number }[]
): PropertyScoreBreakdown {
  const breakdown: PropertyScoreBreakdown = {
    total: 50,
    base: 50,
    pricing: 0,
    marketTime: 0,
    photos: 0,
    description: 0,
  };

  // 1. Pricing Score (0-25 points)
  // Better (lower) price/sqm compared to neighborhood median = higher score
  if (property.price && property.size && property.city && neighborhoodMedian) {
    const pricePerSqm = property.price / property.size;
    const median = neighborhoodMedian.find(
      (m) => m.city.toLowerCase() === property.city.toLowerCase()
    );

    if (median) {
      const priceDiffPercent = ((median.pricePerSqm - pricePerSqm) / median.pricePerSqm) * 100;

      if (priceDiffPercent >= 20) {
        // 20%+ below median = excellent value
        breakdown.pricing = 25;
      } else if (priceDiffPercent >= 15) {
        breakdown.pricing = 22;
      } else if (priceDiffPercent >= 10) {
        breakdown.pricing = 18;
      } else if (priceDiffPercent >= 5) {
        breakdown.pricing = 15;
      } else if (priceDiffPercent >= 0) {
        breakdown.pricing = 12;
      } else if (priceDiffPercent >= -5) {
        breakdown.pricing = 8;
      } else if (priceDiffPercent >= -10) {
        breakdown.pricing = 5;
      } else {
        // More than 10% above median = poor value
        breakdown.pricing = 0;
      }
    }
  }

  // 2. Market Time Score (0-15 points)
  // Fewer days on market = higher score (indicates demand/quality)
  const publishDate = property.publishedAt
    ? new Date(property.publishedAt)
    : property.createdAt
    ? new Date(property.createdAt)
    : null;

  if (publishDate) {
    const daysOnMarket = Math.floor(
      (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysOnMarket <= 7) {
      breakdown.marketTime = 15;
    } else if (daysOnMarket <= 14) {
      breakdown.marketTime = 13;
    } else if (daysOnMarket <= 30) {
      breakdown.marketTime = 10;
    } else if (daysOnMarket <= 60) {
      breakdown.marketTime = 7;
    } else if (daysOnMarket <= 90) {
      breakdown.marketTime = 4;
    } else {
      // More than 90 days = 0 points
      breakdown.marketTime = 0;
    }
  }

  // 3. Photo Completeness Score (0-10 points)
  // ≥5 quality photos = full points
  const photoCount = property.images?.length || 0;

  if (photoCount >= 5) {
    breakdown.photos = 10;
  } else if (photoCount === 4) {
    breakdown.photos = 8;
  } else if (photoCount === 3) {
    breakdown.photos = 6;
  } else if (photoCount === 2) {
    breakdown.photos = 4;
  } else if (photoCount === 1) {
    breakdown.photos = 2;
  } else {
    breakdown.photos = 0;
  }

  // 4. Description Quality Score (0-10 points)
  // Length, keywords, completeness
  if (property.description) {
    const desc = property.description.toLowerCase();
    const wordCount = desc.split(/\s+/).length;

    let score = 0;

    // Length scoring
    if (wordCount >= 100) {
      score += 4;
    } else if (wordCount >= 50) {
      score += 3;
    } else if (wordCount >= 25) {
      score += 2;
    } else {
      score += 1;
    }

    // Quality keywords (add +1 for each, max +6)
    const qualityKeywords = [
      'renovated',
      'modern',
      'luxury',
      'spacious',
      'bright',
      'views',
      'location',
      'amenities',
      'parking',
      'elevator',
    ];

    let keywordCount = 0;
    qualityKeywords.forEach((keyword) => {
      if (desc.includes(keyword)) keywordCount++;
    });

    score += Math.min(keywordCount, 6);

    breakdown.description = Math.min(score, 10);
  }

  // Calculate total
  breakdown.total =
    breakdown.base +
    breakdown.pricing +
    breakdown.marketTime +
    breakdown.photos +
    breakdown.description;

  return breakdown;
}

/**
 * Get score badge color based on score
 */
export function getScoreBadgeColor(score: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (score >= 80) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
    };
  } else if (score >= 65) {
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-300',
    };
  } else if (score >= 50) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
    };
  } else {
    return {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
    };
  }
}

/**
 * Get score label
 */
export function getScoreLabel(
  score: number,
  language: 'en' | 'he' = 'en'
): string {
  if (language === 'he') {
    if (score >= 80) return 'מצוין';
    if (score >= 65) return 'טוב';
    if (score >= 50) return 'בינוני';
    return 'נמוך';
  } else {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  }
}

/**
 * Mock neighborhood median data
 * In production, fetch from API
 */
export const mockNeighborhoodMedians = [
  { city: 'Tel Aviv', pricePerSqm: 25000 },
  { city: 'Jerusalem', pricePerSqm: 18000 },
  { city: 'Herzliya', pricePerSqm: 23000 },
  { city: 'Ramat Aviv', pricePerSqm: 27000 },
  { city: 'Haifa', pricePerSqm: 15000 },
];
