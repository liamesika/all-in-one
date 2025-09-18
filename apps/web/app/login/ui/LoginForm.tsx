'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '../../../lib/firebaseClient';

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
    setErr(null);

    // Basic client-side validation
    if (!email.trim()) {
      setErr('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setErr('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const firebaseAuth = getFirebaseAuth();
      if (!firebaseAuth) {
        throw new Error('Firebase not initialized');
      }

      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await cred.user.getIdToken();
      const r = await fetch('/api/auth/firebase/session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!r.ok) throw new Error('session');
      router.push(next);
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle specific Firebase auth errors
      if (error?.code === 'auth/user-not-found') {
        setErr('No account found with this email. Please check your email or sign up.');
      } else if (error?.code === 'auth/wrong-password') {
        setErr('Incorrect password. Please try again.');
      } else if (error?.code === 'auth/invalid-credential') {
        setErr('Invalid email or password. Please check your credentials and try again.');
      } else if (error?.code === 'auth/invalid-email') {
        setErr('Please enter a valid email address.');
      } else if (error?.code === 'auth/user-disabled') {
        setErr('This account has been disabled. Please contact support.');
      } else if (error?.code === 'auth/too-many-requests') {
        setErr('Too many failed attempts. Please try again later.');
      } else if (error?.message === 'session') {
        setErr('Login successful but session creation failed. Please try again.');
      } else {
        setErr('Login failed. Please check your credentials and try again.');
      }
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
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required
                 className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-200" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
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
