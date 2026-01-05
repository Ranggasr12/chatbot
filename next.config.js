/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Untuk Vercel, hapus atau comment output: 'export'
  // output: 'standalone', // HAPUS BARIS INI
  
  // Nonaktifkan ESLint dan TypeScript checking
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // CORS untuk API
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ]
      }
    ]
  }
}

module.exports = nextConfig