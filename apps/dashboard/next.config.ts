import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@queueless/types', '@queueless/validation', '@queueless/api'],
};

export default nextConfig;
