/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.nhle.com',
        pathname: '/logos/nhl/svg/**',
      },
    ],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
