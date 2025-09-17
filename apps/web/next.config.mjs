// apps/web/next.config.mjs

const config = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Remove rewrites for static export (API routes won't work)
  // 🔁 זה החלק הקריטי שמתקן את ה־404: פרוקסי לשרת ה-API שרץ על 4000
  // async rewrites() {
  //   return [
  //     { source: '/api/:path*', destination: 'http://localhost:4000/api/:path*' },
  //     { source: '/webapi/:path*', destination: '/webapi/:path*' },
  //   ];
  // },
};

export default config;
