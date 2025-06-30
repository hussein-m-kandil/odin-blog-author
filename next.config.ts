import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'ndauvqaezozccgtddhkr.supabase.co',
        pathname: '/storage/**',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;
