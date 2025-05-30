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
};

export default nextConfig;
