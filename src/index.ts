import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Adapter } from "@sveltejs/kit";
import type { NitroConfig } from "nitro/types";
import { nitro } from "nitro/vite";
import { createBuilder } from "vite";

export interface AdapterOptions {
  /**
   * @default node-server
   */
  preset?: NitroConfig["preset"];

  /**
   * @default dist
   */
  out?: string;

  /**
   * @default false
   */
  precompress?: NitroConfig["compressPublicAssets"];

  /**
   * @default true
   */
  minify?: boolean;

  /**
   * @default true
   */
  sourcemap?: boolean;

  /**
   * @default true
   */
  trustProxy?: boolean;

  nitro?: Omit<NitroConfig, "preset" | "output" | "compressPublicAssets" | "serverEntry">;
}

const handlerScript = fileURLToPath(new URL("./handler.mjs", import.meta.url));
const instrumentScript = fileURLToPath(new URL("./instrument.mjs", import.meta.url));

export default function adapter(options?: AdapterOptions): Adapter {
  const {
    preset = "node-server",
    out = "dist",
    precompress = false,
    minify = true,
    sourcemap = true,
    trustProxy = true,
    nitro: nitroConfig = {},
  } = options ?? {};

  return {
    name: "svelte-adapter-nitro",
    supports: {
      read: () => true,
      instrumentation: () => true,
    },
    async adapt(builder) {
      const buildDirectory = builder.getBuildDirectory("nitro");
      const clientDirectory = path.resolve(buildDirectory, "client");
      const prerenderedDirectory = path.resolve(buildDirectory, "prerendered");
      const serverDirectory = path.resolve(buildDirectory, "server");
      const assetsDirectory = path.resolve(buildDirectory, "assets");
      const baseURL = builder.config.kit.paths.base || "/";

      builder.rimraf(buildDirectory);
      builder.mkdirp(buildDirectory);

      builder.writeClient(clientDirectory);
      builder.writePrerendered(prerenderedDirectory);
      builder.writeServer(serverDirectory);
      for (const asset of builder.findServerAssets(builder.routes)) {
        const src = path.resolve(clientDirectory, asset);
        const dst = path.resolve(assetsDirectory, asset);
        builder.copy(src, dst);
      }

      const entryScript = path.resolve(buildDirectory, "entry.js");
      builder.copy(handlerScript, entryScript);

      // Prevent vite from transforming html
      const prerenderedPages = builder.prerendered.pages;
      for (const [key, { file }] of prerenderedPages.entries()) {
        const newFile = `${file}.bin`;
        prerenderedPages.set(key, { file: newFile });

        const html = path.resolve(prerenderedDirectory, file);
        builder.copy(html, path.resolve(prerenderedDirectory, newFile));
        await rm(html);
      }

      const viteBuilder = await createBuilder({
        configFile: false,
        publicDir: false,
        appType: "custom",

        define: {
          TRUST_PROXY: trustProxy,
          PRERENDERED: Object.fromEntries(prerenderedPages),
        },
        resolve: {
          alias: {
            SERVER: path.resolve(serverDirectory, "index.js"),
            MANIFEST: path.resolve(serverDirectory, "manifest.js"),
            INSTRUMENT: builder.hasServerInstrumentationFile()
              ? path.resolve(serverDirectory, "instrumentation.server.js")
              : instrumentScript,
          },
        },

        plugins: [
          nitro({
            ...nitroConfig,
            baseURL,
            preset,
            minify,
            sourcemap,
            output: {
              dir: out,
              publicDir: path.resolve(out, "public"),
              serverDir: path.resolve(out, "server"),
            },
            compressPublicAssets: precompress,

            serverEntry: entryScript,

            serverAssets: [
              ...(nitroConfig.serverAssets ?? []),
              {
                baseName: "server",
                dir: assetsDirectory,
              },
              {
                baseName: "prerendered",
                dir: prerenderedDirectory,
              },
            ],
            publicAssets: [
              ...(nitroConfig.publicAssets ?? []),
              {
                dir: clientDirectory,
                maxAge: 31536000,
                fallthrough: true,
              },
            ],
            framework: {
              name: "svelte-kit",
            },
          }),
        ],
      });

      await viteBuilder.buildApp();
    },
  };
}
