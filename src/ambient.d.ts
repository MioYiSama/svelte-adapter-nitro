declare module "SERVER" {
  export { Server } from "@sveltejs/kit";
}

declare module "MANIFEST" {
  export const manifest: import("@sveltejs/kit").SSRManifest;
}

declare module "INSTRUMENT" {}

declare const TRUST_PROXY: boolean;
