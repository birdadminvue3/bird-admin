import type { BuildOptions } from 'vite';

// 注意：esbuild.drop 属于 vite.config.ts 的顶层配置，不是 build 子项
export function createViteBuild(): BuildOptions {
  return {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'static',
    // 生产不发布 .map，避免源码泄露；需要错误监控时用 hidden + 上传 map
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames(assetInfo: any) {
          if (assetInfo.name?.endsWith('.css')) {
            return 'static/css/[name]-[hash].css';
          }
          const imgExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico'];
          if (imgExts.some(ext => assetInfo.name?.endsWith(ext))) {
            return 'static/imgs/[name]-[hash].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        },
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1]?.split('/')[0] || 'vendor';
          }
        },
      },
    },
  };
}
