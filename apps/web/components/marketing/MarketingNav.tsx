'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { colors } from '@/lib/colors';
import { typography } from '@/lib/typography';
import { spacing } from '@/lib/spacing';

export function MarketingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-[1.5rem] font-semibold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              EFFINITY
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-normal text-gray-700 hover:text-blue-700 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-700 hover:text-blue-700 px-4 py-2 transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-base font-normal text-gray-700 hover:text-blue-700 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 space-y-3 border-t border-gray-200">
              <Link
                href="/login"
                className="block text-center text-sm font-semibold text-gray-700 hover:text-blue-700 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block text-center text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 px-6 py-3 rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
