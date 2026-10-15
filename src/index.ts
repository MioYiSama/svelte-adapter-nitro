import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";

import type { Adapter } from "@sveltejs/kit";
import { defu } from "defu";
import { build, copyPublicAssets, createNitro, prepare } from "nitro/builder";
import type { NitroConfig } from "nitro/types";

import pkg from "../package.json";

interface AdapterOptions {
  /**
   * @default true
   */
  trustProxy?: boolean;

  nitro?: NitroConfig;
}

const handlerScript = url.fileURLToPath(new URL("./handler.mjs", import.meta.url));

export default function adapter(options?: AdapterOptions): Adapter {
  const { trustProxy = true, nitro: nitroConfig = {} } = options ?? {};

  return {
    name: pkg.name,
    supports: {
      read: () => true,
      instrumentation: () => true,
    },
    async adapt(builder) {
      const buildDir = builder.getBuildDirectory("nitro");
      const clientDir = path.join(buildDir, "client");
      const prerenderedDir = path.join(buildDir, "prerendered");
      const serverDir = path.join(buildDir, "server");
      const assetsDir = path.join(buildDir, "assets");

      await fs.rm(buildDir, { force: true, recursive: true });
      builder.writeClient(clientDir);
      builder.writePrerendered(prerenderedDir);
      builder.generateServerInstance(path.join(serverDir, "server.js"));
      for (const asset of builder.findServerAssets(builder.routes)) {
        builder.copy(path.resolve(clientDir, asset), path.resolve(assetsDir, asset));
      }
      builder.copy(handlerScript, path.join(serverDir, "index.js"));

      if (builder.hasServerInstrumentationFile()) {
        builder.instrument({
          entrypoint: path.join(serverDir, "index.js"),
          instrumentation: path.join(builder.getServerDirectory(), "instrumentation.server.js"),
          initializer: builder.createInstrumentationInitializer({ outputDirectory: buildDir }),
          module: {
            // Static imports let Nitro hoist env reads ahead of initialization.
            generateText: ({ initializer, instrumentation, start }) =>
              [
                `import ${JSON.stringify(`./${initializer}`)};`,
                `await import(${JSON.stringify(`./${instrumentation}`)});`,
                `const { default: handler } = await import(${JSON.stringify(`./${start}`)});`,
                "export default handler;",
              ].join("\n"),
          },
        });
      }

      // Mapping prerendered routes
      const routeRules: NonNullable<NitroConfig["routeRules"]> = {};
      for (const [route, { file }] of builder.prerendered.pages) {
        routeRules[route] = { proxy: `/${file}` };
      }
      for (const [route, { status, location }] of builder.prerendered.redirects) {
        routeRules[route] = { redirect: { to: location, status } };
      }

      // Call nitro to build the app
      const nitro = await createNitro(
        defu(nitroConfig, {
          framework: { name: "svelte-kit", version: "3" },
          baseURL: builder.config.paths.base,
          serverEntry: path.join(serverDir, "index.js"),
          routeRules,
          publicAssets: [
            { dir: clientDir, fallthrough: true },
            { dir: prerenderedDir, fallthrough: true },
          ],
          serverAssets: [{ baseName: "assets", dir: assetsDir }],
          alias: { "#SERVER": path.join(serverDir, "server.js") },
          replace: {
            __TRUST_PROXY__: JSON.stringify(trustProxy),
          },
        } satisfies NitroConfig),
      );

      await prepare(nitro);
      await copyPublicAssets(nitro);
      await build(nitro);
    },
  };
}
