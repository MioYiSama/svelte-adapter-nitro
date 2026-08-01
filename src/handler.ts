import "INSTRUMENT";
import { manifest } from "MANIFEST";
import { defineHandler } from "nitro";
import { getRequestIP } from "nitro/h3";
import { useStorage } from "nitro/storage";
import { Server } from "SERVER";

import { html, redirect, createReadableStream } from "./util";

const server = new Server(manifest);
await server.init({
  // Nitro allows us to universally access environment variables
  // using process.env or import.meta.env or the runtime config.
  env: process.env as Record<string, string>,
  async read(file) {
    // https://nitro.build/docs/assets#server-assets
    const data = await useStorage("assets/server").getItemRaw(file);
    return createReadableStream(data);
  },
});

const prerendered = new Map(Object.entries(PRERENDERED));

export default defineHandler({
  middleware: [
    async (event, next) => {
      let { pathname, search } = event.url;
      try {
        pathname = decodeURIComponent(pathname);
      } catch {}

      const value = prerendered.get(pathname);
      if (value) {
        const file = (await useStorage("assets/prerendered").get(value.file)) as any;
        return html(file);
      }

      pathname = pathname.at(-1) === "/" ? pathname.slice(0, -1) : `${pathname}/`;
      if (prerendered.has(pathname)) {
        return redirect(pathname + search, 308);
      }

      return next();
    },
  ],
  handler: async (event) =>
    server.respond(event.req, {
      getClientAddress: () => getRequestIP(event, { xForwardedFor: TRUST_PROXY }) ?? "",
    }),
});
