export type VerticalEnum = 'E_COMMERCE' | 'REAL_ESTATE' | 'LAW' | 'PRODUCTION';
export type VerticalSlug = 'e-commerce' | 'real-estate' | 'law' | 'production';

export const enumToSlug: Record<VerticalEnum, VerticalSlug> = {
  E_COMMERCE: 'e-commerce',
  REAL_ESTATE: 'real-estate',
  LAW: 'law',
  PRODUCTION: 'production',
};

export const slugToEnum: Record<VerticalSlug, VerticalEnum> = {
  'e-commerce': 'E_COMMERCE',
  'real-estate': 'REAL_ESTATE',
  'law': 'LAW',
  'production': 'PRODUCTION',
};

export function getVerticalDashboardPath(vertical: VerticalEnum): string {
  return `/dashboard/${enumToSlug[vertical]}/dashboard`;
}

export function isValidVerticalSlug(slug: string): slug is VerticalSlug {
  return slug in slugToEnum;
}

export function getVerticalFromPath(path: string): VerticalSlug | null {
  const match = path.match(/^\/dashboard\/([^\/]+)/);
  if (match && isValidVerticalSlug(match[1])) {
    return match[1];
  }
  return null;
}