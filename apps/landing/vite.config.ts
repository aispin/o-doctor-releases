import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  // gh-pages 项目页部署在 https://<user>.github.io/<repo>/ 子路径下
  base: "/o-doctor-releases/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  build: {
    target: "es2022",
    // three.js 本身就有 ~520KB，它是 WebGL 渲染器的固有成本，
    // 不是「代码写错了」。调高阈值避免每次构建都刷警告。
    chunkSizeWarningLimit: 600,
    // three.js 体积大，单独切一个 chunk，首屏 JS 不被它拖慢。
    // Vite 8 的 manualChunks 只接受函数形式（对象形式已移除）
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/three")) return "three";
          return undefined;
        },
      },
    },
  },
});