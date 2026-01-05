/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add this to fix Vercel routing
  trailingSlash: false,
  // Disable static optimization for API routes
  experimental: {
    appDir: true,
  }
}

module.exports = nextConfig