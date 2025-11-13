import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    domains: ['axcy4ryac3ty.compat.objectstorage.ap-hyderabad-1.oraclecloud.com'],
  },
};

export default nextConfig;
