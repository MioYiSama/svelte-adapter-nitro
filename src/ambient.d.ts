declare module "SERVER" {
  export { Server } from "@sveltejs/kit";
}

declare module "MANIFEST" {
  export const manifest: import("@sveltejs/kit").SSRManifest;
}

declare module "INSTRUMENT" {}

type MapToRecord<T> = T extends Map<infer K extends PropertyKey, infer V> ? Record<K, V> : never;

declare const TRUST_PROXY: boolean;
declare const PRERENDERED: MapToRecord<import("@sveltejs/kit").Builder["prerendered"]["pages"]>;
