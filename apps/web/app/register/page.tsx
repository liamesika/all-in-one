// apps/web/app/register/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebaseClient';

function RegisterForm() {
  const router = useRouter();
  const qp = useSearchParams();
  const next = qp.get('next') || '/e-commerce/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      const r = await fetch('/api/auth/firebase/session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!r.ok) throw new Error('session');
      router.push(next);
    } catch {
      setErr('Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <main className="min-h-dvh grid place-items-center bg-[rgb(13,13,15)] text-[#EDEEF2] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]">
        <h1 className="text-xl font-semibold mb-1">Create account</h1>
        <p className="text-sm opacity-70 mb-4">Let’s get you set up</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block opacity-80">Email</span>
            <input
              className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-white/30"
              placeholder="you@example.com"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              inputMode="email"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block opacity-80">Password</span>
            <input
              className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-white/30"
              placeholder="Choose a password"
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
            />
          </label>

          {err && <div className="text-sm text-rose-300">{err}</div>}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-white text-black py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {loading ? '...' : 'Create'}
          </button>
        </form>

        <p className="text-sm opacity-80 mt-4">
          Have an account?{' '}
          <a
            className="underline hover:opacity-90"
            href={`/login?next=${encodeURIComponent(next)}`}
          >
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
