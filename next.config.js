/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Enable static export for GitHub Pages
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.newsapi.org',
      },
    ],
  },
  // GitHub Pages base path - automatically set from environment variable during build
  // If your repo is at github.com/username/morning-news, BASE_PATH will be '/morning-news'
  // If using a custom domain or root domain, set BASE_PATH to empty string
  basePath: process.env.BASE_PATH || '',
  assetPrefix: process.env.ASSET_PREFIX || '',
}

module.exports = nextConfig
