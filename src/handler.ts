import { defineHandler } from "nitro";
import { getRequestIP } from "nitro/h3";
import { useKV } from "nitro/kv";

import { server } from "#SERVER";

await server.init({
  env: process.env,
  async read(file) {
    const asset = await useKV("assets:assets").getItem(file);
    if (asset === null || typeof asset !== "string") return null;

    return new Blob([asset]).stream();
  },
});

export default defineHandler(async (event) => {
  return await server.respond(event.req, {
    getClientAddress() {
      return getRequestIP(event, { xForwardedFor: __TRUST_PROXY__ }) ?? "";
    },
  });
});
