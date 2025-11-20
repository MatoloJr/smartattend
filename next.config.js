/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  images: { 
    unoptimized: true 
  },
  compiler: {
    // Enable SWC minification
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
};

export default nextConfig;
