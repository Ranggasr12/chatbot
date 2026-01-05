/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/chat',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:8000'  // Proxy ke Python di development
          : '/api/chat',              // Di production pakai route.js
      },
    ];
  },
};

module.exports = nextConfig;