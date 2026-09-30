import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@vibe/core'],
  serverExternalPackages: ['@libsql/client'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        net: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
