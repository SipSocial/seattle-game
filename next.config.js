/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabled Strict Mode - it causes double-mounting issues with Phaser game lifecycle
  reactStrictMode: false,
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
