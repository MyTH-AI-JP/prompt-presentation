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
  output: 'standalone'
};

module.exports = nextConfig;
