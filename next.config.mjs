/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure environment variables are loaded early
  env: {
    // These will be available at build time and runtime
  },
  
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },

  // Webpack configuration to handle environment loading
  webpack: (config, { dev, isServer }) => {
    // Load environment variables in development
    if (dev) {
      try {
        require('dotenv').config({ path: '.env.local' })
      } catch (error) {
        // Ignore if dotenv fails to load
      }
    }
    
    return config
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
