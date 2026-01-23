/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.leonardo.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.leonardo.ai',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
