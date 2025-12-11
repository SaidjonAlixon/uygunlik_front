/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Use webpack instead of Turbopack
  webpack: (config, { isServer }) => {
    return config;
  },
}

export default nextConfig
