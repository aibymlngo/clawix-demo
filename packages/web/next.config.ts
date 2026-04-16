import withPWAInit from '@ducanh2912/next-pwa';
import type { NextConfig } from 'next';

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  transpilePackages: ['@clawix/shared'],
  // Enable standalone output for Docker production builds
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

export default withPWA(nextConfig);
