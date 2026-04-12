/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  // output: 'export', // Enables static export for App Router
  images: {
    unoptimized: true, // Disable image optimization for static export
  },
};

module.exports = nextConfig;
