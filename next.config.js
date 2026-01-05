/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // WAJIB untuk Netlify: Static Export
  output: 'export',
  
  // WAJIB untuk Netlify
  trailingSlash: true,
  
  // Nonaktifkan image optimization
  images: {
    unoptimized: true,
  },
  
  // Nonaktifkan ESLint/TypeScript checking
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig