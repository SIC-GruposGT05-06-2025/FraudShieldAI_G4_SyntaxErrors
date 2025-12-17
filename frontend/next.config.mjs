/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias['@'] = require('path').resolve(__dirname)
    return config
  }
}

export default nextConfig
