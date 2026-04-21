import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// 仅当入口或页面文件变更时全页刷新，其它改动走 HMR，兼顾稳定与性能
function fullReloadOnSrcChange(): import('vite').Plugin {
  return {
    name: 'full-reload-on-src-change',
    handleHotUpdate(ctx: import('vite').HmrContext) {
      const f = ctx.file.replace(/\\/g, '/');
      const isEntryOrPage = f.includes('/App.tsx') || f.includes('/main.tsx') || f.includes('/pages/');
      if (isEntryOrPage) {
        ctx.server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

export default defineConfig({
  // 本地开发为 `/`；CI 构建 GitHub Pages 时设置 VITE_BASE_PATH=/PIS-System/
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [fullReloadOnSrcChange(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // rc-hiprint 依赖的旧路径，nzh 新版 exports 未暴露该子路径
      'nzh/dist/nzh.min.js': path.resolve(__dirname, '../node_modules/nzh/dist/nzh.min.js'),
    },
  },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
