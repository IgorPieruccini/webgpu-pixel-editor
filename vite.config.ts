import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// A custom loader for WGSL shader imports
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
  base: "./",
  plugins: [solid(), wgslLoader],
});
