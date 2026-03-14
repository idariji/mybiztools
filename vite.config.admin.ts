import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Separate build config for the standalone Admin Portal.
// Run: npx vite build --config vite.config.admin.ts
// Output: dist-admin/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'https://mybiztools.onrender.com';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist-admin',
      emptyOutDir: true,
      rollupOptions: {
        input: 'admin.html',
      },
    },
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
