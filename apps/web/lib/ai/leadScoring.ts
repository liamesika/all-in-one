// AI-driven lead scoring model
interface LeadData {
  id: string;
  source: string;
  interactions: number;
  responseTime: number; // hours
  propertyViews: number;
  budget?: number;
  timeline?: string;
  lastContact: Date;
}

export function calculateLeadScore(lead: LeadData): number {
  let score = 0;
  
  // Source quality (0-20 points)
  const sourceScores: Record<string, number> = {
    'referral': 20,
    'website': 15,
    'facebook': 12,
    'google': 10,
    'walk-in': 8,
    'other': 5
  };
  score += sourceScores[lead.source.toLowerCase()] || 5;
  
  // Engagement level (0-30 points)
  score += Math.min(lead.interactions * 3, 30);
  
  // Response speed (0-20 points)
  if (lead.responseTime < 2) score += 20;
  else if (lead.responseTime < 6) score += 15;
  else if (lead.responseTime < 24) score += 10;
  else score += 5;
  
  // Property interest (0-15 points)
  score += Math.min(lead.propertyViews * 5, 15);
  
  // Budget qualification (0-10 points)
  if (lead.budget && lead.budget > 0) score += 10;
  
  // Timeline urgency (0-5 points)
  if (lead.timeline === 'immediate') score += 5;
  else if (lead.timeline === '1-3-months') score += 3;
  else if (lead.timeline === '3-6-months') score += 1;
  
  // Recency (decay over time)
  const daysSinceContact = (Date.now() - lead.lastContact.getTime()) / (1000 * 60 * 60 * 24);
  const recencyMultiplier = Math.max(0.5, 1 - (daysSinceContact / 30));
  
  return Math.round(Math.min(score * recencyMultiplier, 100));
}

export function getLeadQuality(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}
