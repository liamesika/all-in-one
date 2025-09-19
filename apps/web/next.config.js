import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  

  // External packages for server components (temporarily disabled for build)
  // serverExternalPackages: [
  //   'framer-motion',
  //   'react-window',
  //   'react-window-infinite-loader',
  //   'chart.js',
  //   'react-chartjs-2',
  //   'recharts'
  // ],

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react'
    ],
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Webpack optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // CRITICAL: Fix "self is not defined" error by changing webpack's global object
    // Apply to both client and server to prevent self references in any bundles
    config.output.globalObject = '(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : this)';

    // Additional global polyfills for SSR compatibility - apply to server only
    if (isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'typeof self': '"undefined"',
          'typeof window': '"undefined"',
          'typeof document': '"undefined"',
          'typeof navigator': '"undefined"',
          'self': 'globalThis',
          'window': 'globalThis',
          'document': 'undefined',
          'navigator': 'undefined',
        })
      );
    }

    // Additional webpack runtime safety - disable complex optimizations
    if (!dev) {
      config.optimization.runtimeChunk = false; // Disable runtime chunk splitting to avoid undefined issues
      // Disable splitChunks to avoid webpack runtime dependency issues
      config.optimization.splitChunks = false;
    }

    // Node.js polyfills for browser globals
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };

      // Externalize problematic packages to prevent bundling
      config.externals = config.externals || [];
      config.externals.push({
        'framer-motion': 'framer-motion',
        'react-window': 'react-window',
        'react-window-infinite-loader': 'react-window-infinite-loader',
        'chart.js': 'chart.js',
        'react-chartjs-2': 'react-chartjs-2',
        'recharts': 'recharts',
        'qrcode.react': 'qrcode.react'
      });
    }
    // Bundle analyzer (only in production build with ANALYZE=true)
    if (process.env.ANALYZE === 'true') {
      try {
        const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: isServer ? 8888 : 8889,
            openAnalyzer: true,
          })
        );
      } catch (error) {
        console.warn('webpack-bundle-analyzer not available, skipping bundle analysis');
      }
    }

    // Minimal production optimizations to avoid webpack runtime errors
    if (!dev) {
      // Only basic tree shaking - let Next.js handle the rest
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // Performance budgets (warnings)
    config.performance = {
      maxAssetSize: 500000, // 500kb
      maxEntrypointSize: 500000, // 500kb
      hints: dev ? false : 'warning',
    };

    // Resolve aliases for better tree shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd()),
      'lodash': 'lodash-es', // Use ES modules version of lodash
    };

    // SWC handles import optimization automatically - no need for custom Babel config

    return config;
  },

  // Headers and redirects not supported in static export

  // Environment variables
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_BUILD_ID: process.env.NEXT_BUILD_ID || 'development',
  },

  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // PWA support would require next-pwa package - removed for Next.js 15 compatibility

  // Output configuration - temporarily disabled static export for debugging
  // output: 'export',
  trailingSlash: false,
  images: {
    unoptimized: false, // Re-enabled for SSR build
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    reactStrictMode: true,
  }),

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error'],
      },
    },
  }),
};

export default nextConfig;