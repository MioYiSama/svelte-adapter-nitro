declare module "#SERVER" {
  import type { Server } from "@sveltejs/kit";
  export const server: Server;
}

declare const __TRUST_PROXY__: boolean;
