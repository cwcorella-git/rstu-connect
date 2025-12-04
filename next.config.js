/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // No basePath - deploy directly to root
  trailingSlash: true,
  // Disable image optimization for static export
  experimental: {
    // Enable static page generation
  },
  // Environment variables for client-side code
  env: {
    NEXT_PUBLIC_SOCKETIO_URL: process.env.NEXT_PUBLIC_SOCKETIO_URL || 'https://rstu-gun-relay.onrender.com',
  },
}

module.exports = nextConfig
