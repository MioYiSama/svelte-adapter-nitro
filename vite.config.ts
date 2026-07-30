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
      instrument: "src/instrument.ts",
    },
    outDir: "dist",
    dts: true,
    sourcemap: true,
    minify: true,
    deps: {
      neverBundle: ["SERVER", "MANIFEST", "INSTRUMENT", "nitro", "h3", "srvx"],
    },
  },
  fmt: {
    sortImports: true,
    sortPackageJson: true,
  },
});
