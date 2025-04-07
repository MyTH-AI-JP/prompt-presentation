/** @type {import('next').NextConfig} */
const nextConfig = {
  // 環境変数
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  
  // 静的ファイルの最適化
  optimizeFonts: true,
  
  // サーバーサイドレンダリングの設定
  reactStrictMode: true,
  
  // 出力ターゲット
  output: 'standalone',
  
  // Pagesディレクトリを無効化
  pageExtensions: ['page.js', 'page.jsx', 'page.ts', 'page.tsx'],
  
  // 実験的機能の有効化
  experimental: {
    // App Routerを明示的に有効化
    appDir: true,
    // サーバーコンポーネントを有効化
    serverComponents: true
  }
};

module.exports = nextConfig;
