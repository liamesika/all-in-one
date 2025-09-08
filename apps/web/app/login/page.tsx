'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const apiBase = 'http://localhost:4000';
 const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string;
if (!firebaseApiKey) {
  throw new Error('Missing NEXT_PUBLIC_FIREBASE_API_KEY');
}

 console.log(
  'FIREBASE_API_KEY in runtime:',
  (firebaseApiKey ?? '').slice(0,8) + '...' + (firebaseApiKey ?? '').slice(-6)
);


function LoginForm() {
  const qp = useSearchParams();
  const router = useRouter();
  const next = qp.get('next') || '/e-commerce/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      // 1) לוגין ל-Firebase דרך REST (כמו שבדקנו ב-curl)
      const r1 = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
            returnSecureToken: true,
          }),
        },
      );
      const j1 = await r1.json();
      if (!r1.ok || !j1.idToken) {
        throw new Error(j1?.error?.message || 'auth/invalid-credential');
      }
      const idToken: string = j1.idToken;

      // 2) יצירת session cookie ב־API (ישיר לפורט 4000)
      const r2 = await fetch(`${apiBase}/api/auth/firebase/session`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        cache: 'no-store',
      });
      if (!r2.ok) throw new Error('session');

      // 3) וידוא שהקוקי נקלט
      const me = await fetch(`${apiBase}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      if (!me.ok) throw new Error('no-session-cookie');

      router.replace(next);
    } catch (e: any) {
      console.error('login flow failed:', e);
      setErr(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#F5F9FF] text-[#0B1020] grid place-items-center px-4 py-12 fade-in">
      <div className="w-full max-w-md bg-white border border-[#e1e6f3] rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-2">Log in</h1>
        <p className="text-sm text-[#5F6A89] mb-6">Enter your email and password to continue</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-[#e1e6f3] bg-[#FAFCFF] px-3 py-2 text-sm outline-none focus:border-[#1a75ff] focus:ring-2 focus:ring-[#1a75ff]/20 transition"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-[#e1e6f3] bg-[#FAFCFF] px-3 py-2 text-sm outline-none focus:border-[#1a75ff] focus:ring-2 focus:ring-[#1a75ff]/20 transition"
          />
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button
            disabled={loading}
            className="w-full rounded-lg bg-[#1a75ff] text-white py-2.5 text-sm font-medium hover:bg-[#1667e0] disabled:opacity-60 transition"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="text-xs text-[#5F6A89] mt-4">
          Don't have an account?{' '}
          <a
            href={`/register?next=${encodeURIComponent(next)}`}
            className="text-[#1a75ff] hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
