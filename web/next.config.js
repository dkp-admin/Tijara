/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  reactStrictMode: false,
  images: {
    domains: [
      'sgp1.digitaloceanspaces.com',
      'axcy4ryac3ty.compat.objectstorage.ap-hyderabad-1.oraclecloud.com',
    ],
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'production',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://demo-app.tijarah360.com',
    NEXT_PUBLIC_PRODUCTION_API_URL: process.env.NEXT_PUBLIC_PRODUCTION_API_URL || 'https://be.tijarah360.com',
  },

  // CORS headers - Allow all origins for reports API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With, X-API-Key' },
          { key: 'Access-Control-Allow-Credentials', value: 'false' },
        ],
      },
    ];
  },

  webpack(cfg) {
    cfg.module.rules.push({ test: /\.svg$/, use: ['@svgr/webpack'] });
    return cfg;
  },
};
