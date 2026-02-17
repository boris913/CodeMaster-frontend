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
    // Extraire l'origine de l'API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    let apiOrigin = 'http://localhost:5000';
    try {
      apiOrigin = new URL(apiUrl).origin;
    } catch {}

    return [
      // Réécriture UNIQUEMENT pour les fichiers statiques
      {
        source: '/uploads/:path*',
        destination: `${apiOrigin}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;