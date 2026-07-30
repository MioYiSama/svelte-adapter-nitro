import { sveltekit } from "@sveltejs/kit/vite";
import adapter from "svelte-adapter-nitro";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
      },
      paths: {
        base: "/example",
      },

      adapter: adapter({
        nitro: {
          plugins: ["./src/nitro-plugin.ts"],
        },
      }),
    }),
  ],
});
