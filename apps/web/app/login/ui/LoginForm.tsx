'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebaseClient';

export default function LoginForm() {
  const qp = useSearchParams();
  const router = useRouter();
  const next = qp.get('next') || '/e-commerce/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
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
      setErr('Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#F5F9FF] text-[#0B1020] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#e1e6f3] rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-2">Log in</h1>
        <p className="text-sm text-[#5F6A89] mb-6">Enter your email and password to continue</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
                 className="w-full rounded-lg border border-[#e1e6f3] bg-[#FAFCFF] px-3 py-2 text-sm outline-none focus:border-[#1a75ff] focus:ring-2 focus:ring-[#1a75ff]/20 transition" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                 className="w-full rounded-lg border border-[#e1e6f3] bg-[#FAFCFF] px-3 py-2 text-sm outline-none focus:border-[#1a75ff] focus:ring-2 focus:ring-[#1a75ff]/20 transition" />
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button disabled={loading} className="w-full rounded-lg bg-[#1a75ff] text-white py-2.5 text-sm font-medium hover:bg-[#1667e0] disabled:opacity-60 transition">
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="text-xs text-[#5F6A89] mt-4">
          Don't have an account?{' '}
          <a href={`/register?next=${encodeURIComponent(next)}`} className="text-[#1a75ff] hover:underline">Sign up</a>
        </p>
      </div>
    </main>
  );
}
