/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Nonaktifkan ESLint dan TypeScript saat build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Untuk Netlify
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig