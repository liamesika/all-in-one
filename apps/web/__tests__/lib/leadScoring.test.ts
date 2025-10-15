import { calculateLeadScore, getLeadQuality } from '@/lib/ai/leadScoring';

describe('Lead Scoring', () => {
  it('calculates hot lead score correctly', () => {
    const lead = {
      id: '1',
      source: 'referral',
      interactions: 10,
      responseTime: 1,
      propertyViews: 3,
      budget: 2000000,
      timeline: 'immediate',
      lastContact: new Date()
    };
    
    const score = calculateLeadScore(lead);
    expect(score).toBeGreaterThanOrEqual(70);
    expect(getLeadQuality(score)).toBe('hot');
  });

  it('calculates warm lead score correctly', () => {
    const lead = {
      id: '2',
      source: 'website',
      interactions: 5,
      responseTime: 8,
      propertyViews: 2,
      lastContact: new Date()
    };
    
    const score = calculateLeadScore(lead);
    expect(score).toBeGreaterThanOrEqual(40);
    expect(score).toBeLessThan(70);
    expect(getLeadQuality(score)).toBe('warm');
  });

  it('calculates cold lead score correctly', () => {
    const lead = {
      id: '3',
      source: 'other',
      interactions: 1,
      responseTime: 48,
      propertyViews: 0,
      lastContact: new Date(Date.now() - 86400000 * 30)
    };
    
    const score = calculateLeadScore(lead);
    expect(score).toBeLessThan(40);
    expect(getLeadQuality(score)).toBe('cold');
  });

  it('applies recency decay correctly', () => {
    const recentLead = {
      id: '4',
      source: 'website',
      interactions: 5,
      responseTime: 5,
      propertyViews: 2,
      lastContact: new Date()
    };
    
    const oldLead = {
      ...recentLead,
      lastContact: new Date(Date.now() - 86400000 * 25)
    };
    
    const recentScore = calculateLeadScore(recentLead);
    const oldScore = calculateLeadScore(oldLead);
    
    expect(recentScore).toBeGreaterThan(oldScore);
  });
});
