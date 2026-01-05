/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // IMPORTANT FOR VERCEL
  output: 'standalone',
  // Disable ESLint and TypeScript during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable image optimization for now
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig