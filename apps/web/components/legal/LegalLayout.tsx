// components/legal/LegalLayout.tsx
import React from 'react';
import Link from 'next/link';

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
}

export default function LegalLayout({ children, title, lastUpdated }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-[#2979FF]">
              Effinity
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <Link href="/legal/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <Link href="/legal/ip" className="text-gray-600 hover:text-gray-900 transition-colors">
                IP Notice
              </Link>
              <Link href="/legal/brand" className="text-gray-600 hover:text-gray-900 transition-colors">
                Brand
              </Link>
              <Link href="/legal/content" className="text-gray-600 hover:text-gray-900 transition-colors">
                Content
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title and metadata */}
        <div className="mb-8 pb-6 border-b border-gray-300">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>
        </div>

        {/* Legal content with typography styling */}
        <article className="prose prose-lg prose-gray max-w-none prose-headings:font-semibold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#2979FF] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:list-disc prose-ol:list-decimal">
          {children}
        </article>

        {/* Back to top button */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-[#2979FF] hover:text-[#1565C0] text-sm font-medium transition-colors"
          >
            ↑ Back to top
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              <strong>© {new Date().getFullYear()} Effinity — All Rights Reserved</strong>
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Effinity is a proprietary system developed by Lia Mesika. All visual elements, texts, and software functions are protected under intellectual property law.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              <strong>Unauthorized copying, distribution, or imitation will result in legal action.</strong>
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <Link href="/legal/privacy" className="hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/legal/terms" className="hover:text-gray-900 transition-colors">
                Terms of Use
              </Link>
              <span>•</span>
              <Link href="/legal/ip" className="hover:text-gray-900 transition-colors">
                IP Notice
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              For licensing inquiries: <a href="mailto:support@effinity.co.il" className="text-[#2979FF] hover:underline">support@effinity.co.il</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
