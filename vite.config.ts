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
    },
    outDir: "dist",
    dts: true,
    deps: {
      onlyBundle: false,
      neverBundle: ["#SERVER", "h3"],
    },
  },
  fmt: {
    sortImports: true,
    sortPackageJson: true,
  },
});
