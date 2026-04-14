import { resolve } from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

const wgslLoader = {
  name: "wgsl-loader",
  transform(code: string, id: string) {
    if (id.endsWith(".wgsl")) {
      return {
        code: `export default ${JSON.stringify(code)};`,
        map: null,
      };
    }
  },
};

const extensionEntry = () => ({
  name: "extension-entry",
  transformIndexHtml(html: string) {
    return html.replace("/src/index.tsx", "/extension/index.tsx");
  },
});

export default defineConfig({
  base: "./",
  plugins: [solid(), wgslLoader, extensionEntry()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
    },
  },
});
