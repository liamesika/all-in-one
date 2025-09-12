'use client';

import { useState } from 'react';

type Industry = 'ecommerce' | 'realestate' | 'law';

export default function LandingPage() {
  const [industry, setIndustry] = useState<Industry>('ecommerce');

  return (
    <div className="min-h-dvh bg-white text-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200 animate-fade-in">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <a href="/" className="font-bold text-lg text-brand-blue">all-in-one</a>
          <nav className="hidden md:flex gap-6 text-sm text-neutral-700">
            <a href="#industries" className="hover:text-black">Industries</a>
            <a href="#about" className="hover:text-black">About</a>
            <a href="#contact" className="hover:text-black">Contact</a>
          </nav>
          <div className="flex gap-2">
            <a href="/login"
               className="px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50">
              Log in
            </a>
            <a href="/register"
               className="px-3 py-2 text-sm rounded-lg bg-brand-blue text-white hover:bg-brand-blueDark">
              Sign up
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center px-4 py-20 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Build Smart Websites that Work for You
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-neutral-700 text-lg">
          One platform. Three industries. Infinite growth.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="#industries"
             className="px-5 py-3 rounded-lg bg-brand-blue text-white hover:bg-brand-blueDark">
            Explore Solutions
          </a>
          <a href="#contact"
             className="px-5 py-3 rounded-lg border border-neutral-300 hover:bg-neutral-50">
            Get a Quote
          </a>
        </div>
      </section>

      {/* Industry Selector */}
      <section id="industries" className="px-4 py-12 bg-neutral-50 animate-fade-in">
        <h2 className="text-2xl font-semibold text-center mb-6">Choose your industry</h2>
        <div className="flex justify-center gap-3 flex-wrap">
          {(['ecommerce','realestate','law'] as Industry[]).map(key => (
            <button
              key={key}
              onClick={() => setIndustry(key)}
              className={[
                'px-5 py-2 rounded-full border text-sm transition',
                industry === key
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white border-neutral-300 hover:bg-neutral-100'
              ].join(' ')}
            >
              {key === 'ecommerce' && 'E-Commerce'}
              {key === 'realestate' && 'Real-Estate'}
              {key === 'law' && 'Law'}
            </button>
          ))}
        </div>
        <div className="mt-6 text-center text-neutral-700 max-w-2xl mx-auto">
          {industry === 'ecommerce' && 'We build high-converting online stores with modern UX, fast checkout and full analytics.'}
          {industry === 'realestate' && 'We create real-estate platforms with maps, filters, CRM integrations and smart landing pages.'}
          {industry === 'law' && 'We design authority websites for law firms with lead capture, booking systems and SEO.'}
        </div>
      </section>

      {/* About / explanations */}
      <section id="about" className="px-4 py-16 text-center animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4">Why all-in-one?</h2>
        <p className="max-w-2xl mx-auto text-neutral-700">
          We combine design, technology and automation to deliver websites that don’t just look good — 
          they generate results. From onboarding to growth, we’re your partner every step of the way.
        </p>
      </section>

      {/* Contact */}
      <section id="contact" className="px-4 py-16 bg-neutral-50 animate-fade-in">
        <h2 className="text-2xl font-semibold text-center mb-6">Get in Touch</h2>
        <form className="max-w-xl mx-auto grid gap-4">
          <input className="input" placeholder="Your name" />
          <input className="input" placeholder="Email" type="email" />
          <textarea className="input min-h-32" placeholder="Tell us about your project" />
          <button type="submit"
                  className="px-5 py-3 rounded-lg bg-brand-blue text-white hover:bg-brand-blueDark">
            Send
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-neutral-600">
          <span>© {new Date().getFullYear()} all-in-one</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-black">Privacy</a>
            <a href="/terms" className="hover:text-black">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
