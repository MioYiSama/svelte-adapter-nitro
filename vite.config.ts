import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  check: {
    lint: false,
  },
  pack: {
    entry: {
      index: "src/index.ts",
      handler: "src/handler.ts",
      plugin: "src/plugin.ts",
      instrument: "src/instrument.ts",
    },
    outDir: "dist",
    dts: true,
    sourcemap: true,
    minify: true,
    deps: {
      neverBundle: ["SERVER", "MANIFEST", "INSTRUMENT"],
    },
  },
  fmt: {
    sortImports: true,
    sortPackageJson: true,
  },
});
