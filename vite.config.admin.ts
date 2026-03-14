import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync, renameSync, existsSync } from 'fs';

// Post-build plugin: rename admin.html → index.html and write SPA _redirects
function adminPostBuild(): import('vite').Plugin {
  return {
    name: 'admin-post-build',
    closeBundle() {
      const out = 'dist-admin';
      if (existsSync(`${out}/admin.html`)) {
        renameSync(`${out}/admin.html`, `${out}/index.html`);
      }
      // SPA fallback for Netlify / Render static / most static hosts
      writeFileSync(`${out}/_redirects`, '/* /index.html 200\n');
    },
  };
}

// Separate build config for the standalone Admin Portal.
// Run: npx vite build --config vite.config.admin.ts
// Output: dist-admin/  (index.html + _redirects — ready for any static host)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'https://mybiztools.onrender.com';

  return {
    plugins: [react(), adminPostBuild()],
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
