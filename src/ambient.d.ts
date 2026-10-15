declare module "#SERVER" {
  import type { Server } from "@sveltejs/kit";
  export const server: Server;
}

declare const TRUST_PROXY: boolean;
