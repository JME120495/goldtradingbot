import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/_/backend/:path*',
        destination: 'http://127.0.0.1:3001/:path*'
      },
      {
        source: '/api/:path*',
        destination: 'https://gold-trading-bot-backend.onrender.com/api/:path*'
      }
    ];
  }
};

export default withNextIntl(nextConfig);
