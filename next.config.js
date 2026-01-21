/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
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
}

module.exports = nextConfig
