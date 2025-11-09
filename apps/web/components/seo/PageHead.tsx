'use client';

import { useEffect } from 'react';
import Head from 'next/head';

interface PageHeadProps {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  keywords?: string;
  jsonLd?: object;
}

export function PageHead({
  title,
  description,
  canonical,
  ogImage = 'https://effinity.co.il/og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  keywords,
  jsonLd,
}: PageHeadProps) {
  useEffect(() => {
    // Guard: only run in browser
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Set page title
    document.title = title;

    // Helper to set or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Set or create link tag
    const setLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Basic meta tags
    setMeta('description', description);
    if (keywords) {
      setMeta('keywords', keywords);
    }

    // Canonical URL
    setLink('canonical', canonical);

    // Open Graph tags
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', canonical, true);
    setMeta('og:type', ogType, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:site_name', 'Effinity', true);

    // Twitter Card tags
    setMeta('twitter:card', twitterCard);
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // JSON-LD structured data
    if (jsonLd) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }
  }, [title, description, canonical, ogImage, ogType, twitterCard, keywords, jsonLd]);

  return null;
}
