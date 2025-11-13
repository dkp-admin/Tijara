/** @type {import('next').NextConfig} */
const config = {
  images: {
    domains: [
      "sgp1.digitaloceanspaces.com",
      "axcy4ryac3ty.compat.objectstorage.ap-hyderabad-1.oraclecloud.com",
    ],
  },
  reactStrictMode: false,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

module.exports = config;
