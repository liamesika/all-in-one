import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

/**
 * Generate comprehensive SEO metadata for pages
 */
export function generateSEO({
  title,
  description,
  keywords,
  image = '/og-image.png',
  url,
  type = 'website',
}: SEOProps): Metadata {
  const siteName = 'EFFINITY';
  const fullTitle = title.includes(siteName) ? title : `${title} - ${siteName}`;

  return {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: 'EFFINITY Team' }],
    creator: 'EFFINITY',
    publisher: 'EFFINITY',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: fullTitle,
      description,
      type,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(url && { url }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@effinity',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Default metadata for the marketing site
 */
export const defaultMetadata: Metadata = generateSEO({
  title: 'EFFINITY - Real Estate Management Platform',
  description:
    'All-in-one platform for real estate professionals. Manage leads, properties, campaigns, and automate your workflow with AI-powered tools.',
  keywords:
    'real estate CRM, property management, lead tracking, real estate automation, property listings, real estate software',
});
