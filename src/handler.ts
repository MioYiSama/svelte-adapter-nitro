import { defineHandler } from "nitro";
import { getRequestIP } from "nitro/h3";
import { useStorage } from "nitro/storage";

import { server } from "#SERVER";

import { createReadableStream } from "./util";

await server.init({
  env: process.env,
  async read(file) {
    const result = await useStorage("assets").getItemRaw(file);
    return createReadableStream(result);
  },
});

export default defineHandler({
  middleware: [
    async (event, next) => {
      // TODO: prerendered page
      return next();
    },
  ],
  async handler(event) {
    return await server.respond(event.req, {
      getClientAddress() {
        return getRequestIP(event, { xForwardedFor: TRUST_PROXY }) ?? "";
      },
    });
  },
});
