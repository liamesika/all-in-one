// apps/web/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers = new Headers(init.headers || {});
  // תמיד שולחים org header (עד שיהיה חיבור ל-auth)
  if (!headers.has('x-org-id')) headers.set('x-org-id', 'demo');

  // אל תקבע Content-Type אם שולחים FormData
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (!headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...init, headers, cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText} at ${url} :: ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}
