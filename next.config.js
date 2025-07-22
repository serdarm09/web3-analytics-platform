/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'assets.coingecko.com', 'cryptologos.cc', 'ui-avatars.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  },
  serverExternalPackages: ['mongoose'],
}

module.exports = nextConfig