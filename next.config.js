/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose',
  },
  output: 'export',
  poweredByHeader: false,
  compress: true,
  optimizeFonts: true,
  swcMinify: true,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    optimizeCss: true
  },
};

export default nextConfig
