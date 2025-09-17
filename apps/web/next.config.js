import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  

  // External packages for server components
  serverExternalPackages: [
    'framer-motion',
    'react-window',
    'chart.js',
    'react-chartjs-2'
  ],

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
    // Node.js polyfills for browser globals
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    } else {
      // For server-side, define self globally
      config.plugins.push(
        new webpack.DefinePlugin({
          self: 'global'
        })
      );
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

    // Production optimizations
    if (!dev) {
      // Tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Split chunks optimization
      config.optimization.splitChunks = {
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
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -30,
            reuseExistingChunk: true,
          },
          // Separate chunks for large libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 15,
          },
          firebase: {
            test: /[\\/]node_modules[\\/]firebase[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 10,
          },
        },
      };

      // Minimize CSS
      try {
        const MiniCssExtractPlugin = require('mini-css-extract-plugin');
        config.plugins.push(
          new MiniCssExtractPlugin({
            filename: 'static/css/[contenthash].css',
            chunkFilename: 'static/css/[contenthash].css',
          })
        );
      } catch (error) {
        console.warn('mini-css-extract-plugin not available, using default CSS handling');
      }
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

  // Output configuration - static export to avoid SSR issues
  output: 'export',
  trailingSlash: false,
  images: {
    unoptimized: true, // Required for static export
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