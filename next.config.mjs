/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.nhle.com',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60,
  },
  // Allow cross-origin requests in development from network IP
  allowedDevOrigins: ['10.0.0.182'],
};

export default nextConfig;
