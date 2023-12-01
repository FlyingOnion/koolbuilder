import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import unocss from "unocss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue(), unocss()],
  build: {
    outDir: "docs",
    rollupOptions: {
      output: {
        assetFileNames: "[name][extname]",
        entryFileNames: "[name].js",
      },
    },
  },
});
