import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Read package.json to get build number
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Only expose VITE_ prefixed variables
  const exposedEnvKeys = Object.keys(env).filter(key => key.startsWith('VITE_'));
  const exposedEnv = {};
  exposedEnvKeys.forEach(key => {
    exposedEnv[`process.env.${key}`] = JSON.stringify(env[key]);
  });

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      __BUILD_NUMBER__: JSON.stringify(pkg.buildNumber),
      __VERSION__: JSON.stringify(pkg.version),
      ...exposedEnv
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      historyApiFallback: true,
      port: 5175,
      proxy: {
        '/api/manychat': {
          target: 'https://api.manychat.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/manychat/, '/v1/fb'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to:', req.method, req.url);
              proxyReq.setHeader('Authorization', `Bearer ${process.env.VITE_MANYCHAT_API_KEY}`);
              proxyReq.setHeader('Access-Control-Allow-Origin', '*');
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
            });
          },
        },
      },
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/database'],
          },
        },
      },
    },
  };
});