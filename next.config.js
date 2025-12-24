/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/rstu-connect',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Generate unique build ID to help with cache invalidation
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Environment variables for client-side code
  env: {
    NEXT_PUBLIC_SOCKETIO_URL: process.env.NEXT_PUBLIC_SOCKETIO_URL || 'https://rstu-gun-relay.onrender.com',
  },
}

module.exports = nextConfig
