import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/main.ts"],
  target: "node16",
  platform: "node",
  format: ["cjs"],
  esbuildOptions: (options) => {
    options.mainFields = ["module", "main"]
  },

  minify: true,
  splitting: false,

  clean: true,
})
