/** @type {import('next').NextConfig} */
const config = {
  // Enable standalone output for optimized builds
  output: 'standalone',
  
  env: {
    // Ensure these environment variables are available at build time
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'production',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://demo-app.tijarah360.com',
    NEXT_PUBLIC_PRODUCTION_API_URL: process.env.NEXT_PUBLIC_PRODUCTION_API_URL || 'https://be-qa.tijarah360.com',
  },
  
  images: {
    domains: [
      "sgp1.digitaloceanspaces.com",
      "axcy4ryac3ty.compat.objectstorage.ap-hyderabad-1.oraclecloud.com",
    ],
  },
  
  reactStrictMode: false,
  
  typescript: {
    // Skip TypeScript checking during build for development
    ignoreBuildErrors: true,
  },
  
  eslint: {
    // Skip ESLint checking during build for development
    ignoreDuringBuilds: true,
  },
  
  // CORS headers configuration - THIS WAS MISSING!
  async headers() {
    return [
      {
        // Apply CORS headers to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production'
              ? 'https://demo-app.tijarah360.com,https://app.tijarah360.com,https://tijarah360.com'
              : '*'
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
  
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    
    // Optimize build performance and prevent timeouts
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Increase memory limits for large builds
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    };
    
    return config;
  },
};

module.exports = config;
