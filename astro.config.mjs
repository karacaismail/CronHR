import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// GitHub Pages project site: https://karacaismail.github.io/CronHR/
export default defineConfig({
  site: "https://karacaismail.github.io",
  base: "/CronHR",
  output: "static",
  trailingSlash: "always",
  integrations: [react()],
  build: { format: "directory" },
});
