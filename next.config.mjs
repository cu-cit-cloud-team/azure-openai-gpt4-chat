/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'daisyui',
      'dexie',
      'gpt-tokenizer',
      'openai',
      'react-markdown',
      'react-syntax-highlighter',
      'remark-gfm',
      'remark-math',
      'remark-parse',
      'remark-rehype',
      'rehype-katex',
      'rehype-sanitize',
      'rehype-stringify',
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
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
