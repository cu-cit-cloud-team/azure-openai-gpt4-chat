/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      '@ai-sdk/azure',
      '@ai-sdk/react',
      'ai',
      'dexie',
      'dexie-react-hooks',
      'gpt-tokenizer',
      'jotai',
      'lucide-react',
      'react-markdown',
      'react-syntax-highlighter',
      'remark-gfm',
      'remark-math',
      'rehype-katex',
      'streamdown',
    ],
  },
  transpilePackages: [
    'react-markdown',
    'remark-gfm',
    'remark-math',
    'remark-parse',
    'remark-rehype',
    'rehype-katex',
    'rehype-sanitize',
    'rehype-stringify',
    'unified',
  ],
  turbopack: {
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Security headers for production
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
