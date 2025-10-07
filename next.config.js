/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@libsql/client', '@prisma/client'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent Node.js-specific modules from being bundled for the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      
      // Alias problematic libsql modules to false for client-side builds
      config.resolve.alias = {
        ...config.resolve.alias,
        '@libsql/libsql-wasm-experimental': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
