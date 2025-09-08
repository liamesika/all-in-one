export function computeLeadScore(opts: { source?: string; interest?: string; budget?: number; email?: string | null; phoneNorm?: string | null; }) {
  let s = 0;
  if (opts.source === 'website') s += 20;
  if (opts.source === 'meta') s += 15;
  if (opts.source === 'contact_form') s += 25;
  if (opts.interest) s += 10;
  if ((opts.budget || 0) >= 7000) s += 20;
  if (opts.email) s += 5;
  if (opts.phoneNorm) s += 10;
  return Math.max(0, Math.min(100, s));
}
