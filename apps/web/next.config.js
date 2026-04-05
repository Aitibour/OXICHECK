/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "logo.clearbit.com" },
    ],
  },
};

export default nextConfig;
