import type { BuildOptions } from 'vite';

export function createViteBuild(): BuildOptions {
  const viteBuild = {
    target: 'es2015',
    // 指定输出路径
    outDir: 'dist',
    // 指定生成静态资源的存放路径
    assetsDir: 'static',
    // 构建后是否生成 source map 文件。
    sourcemap: false,
    // 启用/禁用 brotli 压缩大小报告。压缩大型输出文件可能会很慢，因此禁用该功能可能会提高大型项目的构建性能。
    brotliSize: false,
    // minify: 'terser',
    // chunk 大小警告的限制（以 kbs 为单位）
    chunkSizeWarningLimit: 2000,
    TerserOptions: {
      compress: {
        // 打包自动删除console
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        chunkFileNames: "static/js/[name]-[hash].js", // chunk文件打包
        entryFileNames: "static/js/[name]-[hash].js", // 入口文件打包
        assetFileNames(assetInfo: any) {
          // css文件打包
          if (assetInfo.name?.endsWith('.css')) {
            return 'static/css/[name]-[hash].css'
          }
          // 定义图片类型
          const imgExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico'];
          if (imgExts.some(ext => assetInfo.name?.endsWith(ext))) {
            return 'static/imgs/[name]-[hash].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        },
        manualChunks(id: any) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  };
  return viteBuild;
}
