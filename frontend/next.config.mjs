/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["mongodb", "jsonwebtoken"],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), "canvas", "jsdom"];
    return config;
  },
};

export default nextConfig;
