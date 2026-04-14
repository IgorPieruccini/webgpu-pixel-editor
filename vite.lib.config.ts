import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// Keep shader imports working when the package bundles the pixel editor core.
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

export default defineConfig({
  plugins: [solid(), wgslLoader],
  build: {
    lib: {
      entry: "src/lib.ts",
      name: "IsoPixelProjectConfig",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["solid-js"],
    },
  },
});
