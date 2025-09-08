export function normalizePhone(p?: string | null) {
  if (!p) return null;
  const digits = p.replace(/\D/g, '');
  if (digits.startsWith('972')) return '0' + digits.slice(3);
  return digits;
}
