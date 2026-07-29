import "INSTRUMENT";
import { manifest } from "MANIFEST";
import { defineHandler } from "nitro";
import { getRequestIP } from "nitro/h3";
import { useStorage } from "nitro/storage";
import { Server } from "SERVER";

const server = new Server(manifest);
await server.init({
  env: process.env as Record<string, string>,
  async read(file) {
    const data = await useStorage("assets:server").getItemRaw(file);

    if (!data) return null;

    return new ReadableStream({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });
  },
});

export default defineHandler(async (event) =>
  server.respond(event.req, {
    getClientAddress: () => getRequestIP(event, { xForwardedFor: TRUST_PROXY }) ?? "",
  }),
);
