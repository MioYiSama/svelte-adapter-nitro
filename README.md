# svelte-adapter-nitro

[![npm version](https://img.shields.io/npm/v/svelte-adapter-nitro?logo=npm)](https://www.npmjs.com/package/svelte-adapter-nitro)
[![npm downloads](https://img.shields.io/npm/dm/svelte-adapter-nitro?logo=npm)](https://www.npmjs.com/package/svelte-adapter-nitro)
[![License](https://img.shields.io/npm/l/svelte-adapter-nitro)](./LICENSE)
[![Node.js](https://img.shields.io/node/v/svelte-adapter-nitro?logo=node.js)](https://www.npmjs.com/package/svelte-adapter-nitro)

A [SvelteKit](https://svelte.dev/docs/kit/introduction) adapter powered by [Nitro](https://nitro.build/).

Deploy your SvelteKit applications across any platform supported by Nitro—including Node.js, Vercel, Cloudflare, Netlify, AWS Lambda, Bun, Deno, and more.

## Installation

```bash
npm install -D svelte-adapter-nitro nitro
# or
pnpm add -D svelte-adapter-nitro nitro
# or
bun add -d svelte-adapter-nitro nitro
```

> **Note:** `nitro` and `@sveltejs/kit` are required peer dependencies.

## Usage

Configure the adapter in `vite.config.ts`:

```ts
import { sveltekit } from "@sveltejs/kit/vite";
import adapter from "svelte-adapter-nitro";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({
        preset: "node-server",
      }),
    }),
  ],
});
```

Or in `svelte.config.js`:

```js
import adapter from "svelte-adapter-nitro";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      preset: "node-server",
    }),
  },
};

export default config;
```

## Options

| Option        | Type                         | Default         | Description                                                                                                    |
| ------------- | ---------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| `preset`      | `NitroConfig["preset"]`      | `'node-server'` | Target deployment preset for Nitro (e.g. `'vercel'`, `'cloudflare-pages'`, `'aws-lambda'`, `'bun'`, `'deno'`). |
| `out`         | `string`                     | `'dist'`        | Output directory for the build.                                                                                |
| `precompress` | `boolean \| CompressOptions` | `false`         | Enable pre-compression of public assets and prerendered routes (gzip, brotli, zstd).                           |
| `minify`      | `boolean`                    | `true`          | Minify the server bundle output.                                                                               |
| `sourcemap`   | `boolean`                    | `true`          | Generate sourcemaps for the server build.                                                                      |
| `trustProxy`  | `boolean`                    | `true`          | Trust `X-Forwarded-For` proxy headers for `event.getClientAddress()`.                                          |
| `nitro`       | `NitroConfig`                | `{}`            | Additional Nitro options passed directly to the Nitro engine.                                                  |

## Bundling Native Production Dependencies

If your application relies on native production dependencies (e.g., C/C++ native modules like `sharp`, `canvas`, database drivers, or Prisma) or you need external packages traced and bundled into the production output, pass Nitro's `traceDeps` array via `nitro`:

```ts
adapter({
  preset: "node-server",
  nitro: {
    // Trace specific packages into the build output
    traceDeps: ["sharp", "prisma*"],
  },
});
```

`traceDeps` supports:

- Full package trace syntax using wildcards (e.g. `'pkg*'`).
- Exclusions using a leading exclamation mark (e.g. `'!pkg'`).
- Regular expressions (e.g. `/^@prisma\//`).

## Running Code on Shutdown

If your application needs to execute code when the Nitro server shuts down, define a Nitro plugin and register a `close` hook. For example, create `src/nitro/cleanup.ts`:

```ts
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("close", async () => {
    // Close database connections, stop timers, flush telemetry, etc.
  });
});
```

Register the plugin through the adapter's `nitro` options:

```ts
adapter({
  preset: "node-server",
  nitro: {
    plugins: ["./src/nitro/cleanup.ts"],
  },
});
```

The `close` hook runs during a graceful Nitro shutdown. See the [Nitro lifecycle documentation](https://nitro.build/docs/lifecycle) for available hooks and deployment-specific behavior.

## License

[MIT](./LICENSE)
