/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['stickgenusers.s3.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'stickgenusers.s3.amazonaws.com',
        port: '',
        pathname: '/animations/**',
      },
    ],
  },
}

module.exports = nextConfig 