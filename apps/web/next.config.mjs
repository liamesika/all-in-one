// apps/web/next.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  experimental: { externalDir: true },

  // אין צורך כרגע באליאסים מיוחדים; נשאיר נקי
  webpack: (cfg) => {
    cfg.resolve = cfg.resolve || {};
    cfg.resolve.alias = { ...(cfg.resolve.alias || {}) };
    return cfg;
  },

  // 🔁 זה החלק הקריטי שמתקן את ה־404: פרוקסי לשרת ה-API שרץ על 4000
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:4000/api/:path*' },
          { source: '/webapi/:path*', destination: '/webapi/:path*' },

    ];
  },
};

export default config;
