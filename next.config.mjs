import MillionLint from '@million/lint';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: true,
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
    turbo: {
      resolveExtensions: [
        '.mdx',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.mjs',
        '.json',
      ],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

// export default nextConfig;
export default process.env.NODE_ENV === 'production'
  ? nextConfig
  : MillionLint.next({ rsc: true })(nextConfig);
