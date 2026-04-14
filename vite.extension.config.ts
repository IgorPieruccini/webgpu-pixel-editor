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

export default defineConfig({
  base: "./",
  plugins: [solid(), wgslLoader],
  resolve: {
    alias: [
      {
        find: /^\/src\/index\.tsx$/,
        replacement: "/extension/index.tsx",
      },
    ],
  },
});
