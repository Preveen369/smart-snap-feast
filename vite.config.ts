import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // OpenAI API proxy for development environment
        '/api/openai': {
          target: 'https://api.openai.com/v1',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/openai/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Add the API key to the request header
              const apiKey = env.VITE_OPENAI_API_KEY;
              if (apiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
                proxyReq.setHeader('Content-Type', 'application/json');
              } else {
                console.error('❌ Proxy: VITE_OPENAI_API_KEY not found in environment');
              }
            });
            
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('✅ OpenAI API response received:', proxyRes.statusCode);
            });
            
            proxy.on('error', (err, req, res) => {
              console.error('❌ OpenAI Proxy error:', err.message);
            });
          },
        },

        // Google Gemini API proxy for development environment
        '/api/gemini': {
          target: 'https://generativelanguage.googleapis.com/v1beta',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/gemini/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              const apiKey = env.VITE_GEMINI_API_KEY;
              if (apiKey) {
                // Gemini uses query parameter for API key
                const originalPath = proxyReq.path;
                const separator = originalPath.includes('?') ? '&' : '?';
                proxyReq.path = `${originalPath}${separator}key=${apiKey}`;
                proxyReq.setHeader('Content-Type', 'application/json');
              } else {
                console.warn('⚠️ Proxy: VITE_GEMINI_API_KEY not found - Gemini features disabled');
              }
            });
            
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('✅ Gemini API response received:', proxyRes.statusCode);
            });
            
            proxy.on('error', (err, req, res) => {
              console.error('❌ Gemini Proxy error:', err.message);
            });
          },
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Optimize build for production
      target: 'es2020',
      minify: 'esbuild',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
            'ai-services': ['./src/services/openai.ts', './src/services/gemini.ts', './src/services/ai.ts']
          }
        }
      }
    },
    define: {
      // Ensure environment variables are available at build time
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    }
  };
});
