import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: false, // Disable fast refresh in production for better perf
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // Minification with aggressive settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.log', 'console.info'],
      },
      format: {
        comments: false,
      },
      mangle: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules/react')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-hot-toast') || id.includes('node_modules/react-helmet')) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules/browser-image-compression')) {
            return 'vendor-image';
          }
          if (id.includes('node_modules/axios')) {
            return 'vendor-http';
          }
          // Page-specific chunks for better caching
          if (id.includes('/pages/admin/')) {
            return 'pages-admin';
          }
          if (id.includes('/pages/')) {
            return 'pages-public';
          }
          // Component chunks
          if (id.includes('/components/')) {
            return 'components';
          }
        },
        // Optimize asset names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|gif|svg/.test(ext)) {
            return `images/[name].[hash][extname]`;
          }
          if (/woff|woff2|ttf|otf|eot/.test(ext)) {
            return `fonts/[name].[hash][extname]`;
          }
          return `css/[name].[hash][extname]`;
        },
        chunkFileNames: 'js/[name].[hash].js',
        entryFileNames: 'js/[name].[hash].js',
      },
    },
    sourcemap: false,
    target: 'esnext',
    chunkSizeWarningLimit: 500,
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: 'lightningcss',
    reportCompressedSize: false,
  },
  optimization: {
    minimize: true,
  },
});
