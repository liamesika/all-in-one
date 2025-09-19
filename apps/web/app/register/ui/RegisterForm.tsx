'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '../../../lib/firebaseClient';

export default function RegisterForm() {
  const router = useRouter();
  const qp = useSearchParams();
  const next = qp.get('next') || '/e-commerce/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string|null>(null);
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
      setErr('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setErr('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const firebaseAuth = getFirebaseAuth();
      if (!firebaseAuth) {
        throw new Error('Firebase not initialized');
      }

      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await cred.user.getIdToken();
      const r = await fetch('/api/auth/firebase/session', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!r.ok) throw new Error('session');
      router.push(next);
    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle specific Firebase auth errors
      if (error?.code === 'auth/email-already-in-use') {
        setErr('This email is already registered. Please use a different email or try logging in.');
      } else if (error?.code === 'auth/weak-password') {
        setErr('Password is too weak. Please use at least 6 characters.');
      } else if (error?.code === 'auth/invalid-email') {
        setErr('Please enter a valid email address.');
      } else if (error?.code === 'auth/operation-not-allowed') {
        setErr('Email registration is not enabled. Please contact support.');
      } else if (error?.message === 'session') {
        setErr('Registration successful but session creation failed. Please try logging in.');
      } else if (error?.message?.includes('Firebase authentication not configured')) {
        setErr('Authentication service is not configured. Please contact support.');
      } else {
        setErr('Registration failed. Please try again.');
      }
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
            <input className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-white/30"
                   type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} inputMode="email" required />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block opacity-80">Password</span>
            <input className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-white/30"
                   placeholder="Choose a password" type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required />
          </label>
          {err && <div className="text-sm text-rose-300">{err}</div>}
          <button disabled={loading} className="w-full rounded-xl bg-white text-black py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60">
            {loading ? '...' : 'Create'}
          </button>
        </form>
        <p className="text-sm opacity-80 mt-4">
          Have an account?{' '}
          <a className="underline hover:opacity-90" href={`/login?next=${encodeURIComponent(next)}`}>
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}
