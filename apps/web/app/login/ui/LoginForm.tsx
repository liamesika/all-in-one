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
    <main className="min-h-dvh bg-blue-50 text-gray-900 grid place-items-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6">
        <h1 className="text-base font-semibold mb-2">Log in</h1>
        <p className="text-sm font-normal text-gray-600 mb-6">Enter your email and password to continue</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
                 className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-200" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                 className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-200" />
          {err && <div className="text-sm font-normal text-red-600">{err}</div>}
          <button disabled={loading} className="w-full rounded-lg bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow">
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="text-sm font-normal text-gray-600 mt-4">
          Don't have an account?{' '}
          <a href={`/register?next=${encodeURIComponent(next)}`} className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">Sign up</a>
        </p>
      </div>
    </main>
  );
}
