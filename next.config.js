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
}

module.exports = nextConfig
