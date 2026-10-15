# svelte-adapter-nitro

[![npm version](https://img.shields.io/npm/v/svelte-adapter-nitro?logo=npm)](https://www.npmjs.com/package/svelte-adapter-nitro)
[![npm downloads](https://img.shields.io/npm/dm/svelte-adapter-nitro?logo=npm)](https://www.npmjs.com/package/svelte-adapter-nitro)
[![License](https://img.shields.io/npm/l/svelte-adapter-nitro)](./LICENSE)
[![Node.js](https://img.shields.io/node/v/svelte-adapter-nitro?logo=node.js)](https://www.npmjs.com/package/svelte-adapter-nitro)

A [SvelteKit](https://svelte.dev/docs/kit/introduction) adapter powered by [Nitro](https://nitro.build/).

Deploy your SvelteKit applications across any platform supported by Nitro—including Node.js, Vercel, Cloudflare, Netlify, AWS Lambda, Bun, Deno, and more.

## Compatibility

| Adapter version | Supported SvelteKit version |
| --------------- | --------------------------- |
| v0.0.x          | SvelteKit 2 only            |
| v0.1.x          | SvelteKit 3 only            |

For SvelteKit 2 projects, install `svelte-adapter-nitro@0.0`. The installation, configuration, and options below apply to v0.1.x and SvelteKit 3.

## Installation

```bash
npm install -D svelte-adapter-nitro@0.1 nitro@3.0.260903-beta
# or
pnpm add -D svelte-adapter-nitro@0.1 nitro@3.0.260903-beta
# or
bun add -d svelte-adapter-nitro@0.1 nitro@3.0.260903-beta
```

> **Note:** v0.1.x requires SvelteKit 3, Nitro 3, and Vite 8 or later as peer dependencies.

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
        nitro: {
          preset: "node-server",
        },
      }),
    }),
  ],
});
```

SvelteKit 3 configuration belongs in the `sveltekit()` Vite plugin, not `svelte.config.js`.

## Options

| Option       | Type          | Default | Description                                                           |
| ------------ | ------------- | ------- | --------------------------------------------------------------------- |
| `trustProxy` | `boolean`     | `true`  | Trust `X-Forwarded-For` proxy headers for `event.getClientAddress()`. |
| `nitro`      | `NitroConfig` | `{}`    | Nitro configuration, including deployment presets and build options.  |

Pass options such as `preset`, `output`, `minify`, and `sourcemap` through `nitro`, not at the adapter's top level. The old top-level `out` and `precompress` options are no longer supported; configure output and asset compression through Nitro.

### Prerendered Routes

Prerendered pages are automatically mapped to Nitro `routeRules` using their generated files: `/` proxies to `/index.html`, `/about` to `/about.html`, and `/about/` to `/about/index.html`. Prerendered redirects preserve their target and HTTP status. Prerendered assets are served directly from the public assets directory.

Explicit `nitro.routeRules` options take precedence over generated rules; other rule properties are merged.

## Server Instrumentation

Create `src/instrumentation.server.ts` to initialize tracing or other server instrumentation. Before Nitro bundling, the adapter wraps the SvelteKit handler with an entrypoint that initializes runtime environment variables declared in `src/env.ts`, dynamically loads instrumentation, then dynamically loads the application handler.

To also enable SvelteKit's built-in OpenTelemetry spans, configure the SvelteKit Vite plugin:

```ts
sveltekit({
  adapter: adapter(),
  tracing: {
    server: true,
  },
});
```

Instrumentation requires ES module output with code splitting; single-file/IIFE builds cannot use this startup sequence. Choose an instrumentation SDK compatible with your deployment runtime—Node.js SDKs do not automatically work on edge runtimes.

## Bundling Native Production Dependencies

If your application relies on native production dependencies (e.g., C/C++ native modules like `sharp`, `canvas`, database drivers, or Prisma) or you need external packages traced and bundled into the production output, pass Nitro's `traceDeps` array via `nitro`:

```ts
adapter({
  nitro: {
    preset: "node-server",
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
  nitro: {
    preset: "node-server",
    plugins: ["./src/nitro/cleanup.ts"],
  },
});
```

The `close` hook runs during a graceful Nitro shutdown. See the [Nitro lifecycle documentation](https://nitro.build/docs/lifecycle) for available hooks and deployment-specific behavior.

## License

[MIT](./LICENSE)
