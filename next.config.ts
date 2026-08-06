import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['motion-dom'],
  webpack: (config) => {
    if (config.optimization?.splitChunks?.cacheGroups) {
      const groups = config.optimization.splitChunks.cacheGroups as Record<string, { [key: string]: unknown }>;
      for (const key of Object.keys(groups)) {
        if (groups[key].test && groups[key].test instanceof RegExp && groups[key].test.source?.includes('motion')) {
          delete groups[key];
        }
      }
    }
    return config;
  },
};

export default nextConfig;
