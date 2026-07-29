import { definePlugin } from "nitro";

/**
 * @link https://svelte.dev/docs/kit/adapter-node#Graceful-shutdown
 */
export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("close", async () => {
    process.emit("sveltekit:shutdown");
  });
});
