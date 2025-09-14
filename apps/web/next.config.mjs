// apps/web/next.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bundle analyzer
const withBundleAnalyzer = (() => {
  if (process.env.ANALYZE === 'true') {
    const { default: analyzer } = await import('@next/bundle-analyzer');
    return analyzer({
      enabled: true,
      openAnalyzer: true,
    });
  }
  return (config) => config;
})();

const config = {
  experimental: { 
    externalDir: true,
    optimizeCss: true, // CSS optimization
  },

  // Performance optimizations
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true, // Enable React strict mode

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack optimizations
  webpack: (cfg, { dev, isServer }) => {
    cfg.resolve = cfg.resolve || {};
    cfg.resolve.alias = { ...(cfg.resolve.alias || {}) };
    
    // Performance optimizations for production
    if (!dev) {
      // Enable tree shaking
      cfg.optimization.usedExports = true;
      cfg.optimization.sideEffects = false;
      
      // Minimize CSS
      cfg.optimization.minimizer = cfg.optimization.minimizer || [];
      
      // Split chunks for better caching
      cfg.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: -30,
          },
        },
      };
    }

    return cfg;
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // 🔁 זה החלק הקריטי שמתקן את ה־404: פרוקסי לשרת ה-API שרץ על 4000
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:4000/api/:path*' },
      { source: '/webapi/:path*', destination: '/webapi/:path*' },
    ];
  },

  // Environment variables for performance monitoring
  env: {
    ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'production' ? 'true' : 'false',
  },
};

export default withBundleAnalyzer(config);
