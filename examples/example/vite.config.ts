import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import adapter from "svelte-adapter-nitro";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    enhancedImages(),
    sveltekit({
      adapter: adapter(),
    }),
  ],
});
