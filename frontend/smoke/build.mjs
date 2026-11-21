import { build } from 'esbuild';
import path from 'path';

await build({
  entryPoints: ['smoke/entry.jsx'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  outfile: 'smoke/out.cjs',
  jsx: 'automatic',
  loader: {
    '.css': 'empty',
    '.png': 'text',
    '.webp': 'text',
    '.svg': 'text',
    '.jpg': 'text',
    '.woff2': 'text',
    '.mp4': 'text',
  },
  alias: {
    'next/link': path.resolve('smoke/link.jsx'),
    'next/navigation': path.resolve('smoke/nav.js'),
  },
  logLevel: 'info',
});
console.log('esbuild done');
