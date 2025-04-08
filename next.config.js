/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com; connect-src 'self' https://slides.googleapis.com https://www.googleapis.com; frame-src 'self' https://accounts.google.com;",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // クライアントサイドでのNode.jsモジュールの参照を解決
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        http: false,
        https: false,
        stream: false,
        zlib: false,
        crypto: false,
        path: false
      };
    }
    return config;
  },
};

module.exports = nextConfig;
