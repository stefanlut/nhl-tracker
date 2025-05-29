/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
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
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
