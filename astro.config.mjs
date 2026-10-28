import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import sanity from "@sanity/astro";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

export default defineConfig({
  site: "https://ebte.zeitzmocaa.art",
  output: "server",
  adapter: vercel({
    includeFiles: ["node_modules/@sparticuz/chromium/bin"],
    maxDuration: 60
  }),
  vite: {
    ssr: {
      // Chromium resolves its compressed binaries relative to its own module.
      external: ["@sparticuz/chromium", "puppeteer"]
    }
  },
  devToolbar: {
    enabled: false
  },
  integrations: [
    sanity({
      projectId: env.PUBLIC_SANITY_PROJECT_ID || "p7t0rr17",
      dataset: env.PUBLIC_SANITY_DATASET || "production",
      useCdn: false,
      apiVersion: "2026-07-09",
      studioBasePath: "/studio",
      stega: {
        studioUrl: env.SANITY_STUDIO_URL || "http://localhost:4321/studio"
      }
    }),
    react()
  ]
});
