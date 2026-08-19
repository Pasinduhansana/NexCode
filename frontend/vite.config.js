import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { imagetools } from 'vite-imagetools'

// The public site is a Vite SPA, but its components were written against
// Next.js (`next/link`, `next/navigation`). Provide virtual modules that map
// those specifiers to react-router-backed implementations so the SPA runs
// without the Next.js runtime. (Virtual modules avoid the optimizeDeps
// interop quirk that breaks default-export detection on file aliases.)
function nextShims() {
  const norm = (id) => (typeof id === 'string' ? id.replace(/\\/g, '/') : '');
  const isLink = (id) => norm(id).endsWith('node_modules/next/link.js');
  const isNav = (id) => norm(id).endsWith('node_modules/next/navigation.js');
  return {
    name: 'next-shims',
    // Vite resolves `next/link` and `next/navigation` to these package entry
    // files via its internal resolver, so we substitute react-router-backed
    // implementations in `load` (the virtual-module resolveId approach is
    // bypassed by Vite's resolver). This lets the Vite SPA run without the
    // Next.js runtime.
    load(id) {
      if (isLink(id)) {
        return `
          import React from 'react';
          import { Link as RRLink } from 'react-router-dom';
          export default function Link({ href, to, replace, onClick, className, children, ...rest }) {
            const target = href != null ? href : to;
            const props = target
              ? { to: target, replace, onClick, className, ...rest }
              : { className, onClick, ...rest };
            return React.createElement(target ? RRLink : 'a', props, children);
          }
        `;
      }
      if (isNav(id)) {
        return `
          import * as RR from 'react-router-dom';
          export function useRouter() {
            const navigate = RR.useNavigate();
            return {
              push: (h) => navigate(h),
              replace: (h) => navigate(h, { replace: true }),
              back: () => navigate(-1),
              forward: () => navigate(1),
              refresh: () => {},
              prefetch: () => {},
            };
          }
          export function usePathname() { return RR.useLocation().pathname; }
          export function useParams() { return RR.useParams(); }
          export function useSearchParams() { return RR.useSearchParams(); }
        `;
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    nextShims(),
    react(),
    imagetools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['fonts/*.woff2', 'assets/*.{png,webp,jpg}'],
      manifest: {
        name: 'NexCode Software Development',
        short_name: 'NexCode',
        description: 'Custom Software Solutions. Modern Technology. Real Results.',
        theme_color: '#3699f3',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/assets/Logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/Logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|webp|jpg|jpeg|svg|gif|ico)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /^https:\/\/formspree\.io\/.*/i,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'formspree'
            }
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['next/link', 'next/navigation'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['framer-motion'],
          icons: ['lucide-react', 'react-icons']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        proxyTimeout: 120000
      }
    }
  }
})
