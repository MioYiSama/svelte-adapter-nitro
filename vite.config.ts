import * as url from "node:url";

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
    dts: {
      // tsdown only auto-detects TypeScript 7.0; point it at the 7.x native compiler explicitly.
      generator: "tsgo",
      tsgo: {
        path: url.fileURLToPath(new URL("bin/tsc", import.meta.resolve("typescript/package.json"))),
      },
    },
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
