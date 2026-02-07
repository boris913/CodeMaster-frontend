/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      'api.grafikart.fr',
      'img.youtube.com',
      'i.ytimg.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'codemaster-storage.s3.amazonaws.com',
      'storage.googleapis.com',
      process.env.NEXT_PUBLIC_API_URL?.replace('http://', '').replace('https://', '').split(':')[0]
    ].filter(Boolean),
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;