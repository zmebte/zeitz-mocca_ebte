import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { media } from "sanity-plugin-media";
import { schemaTypes } from "./schemaTypes/index.ts";
import { resolve } from "./src/sanity/presentation/resolve.ts";
import { structure } from "./src/sanity/structure.ts";

export default defineConfig({
  name: "default",
  title: "Everything but the Exhibition Studio",
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || "p7t0rr17",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",
  plugins: [
    structureTool({ structure }),
    media(),
    presentationTool({
      resolve,
      previewUrl: {
        initial: import.meta.env.SANITY_STUDIO_PREVIEW_URL || "http://localhost:4321",
        previewMode: {
          enable: "/api/draft-mode/enable"
        }
      }
    })
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !["submissionsPage", "contactPage", "footer"].includes(schemaType))
  },
  document: {
    actions: (actions, { schemaType }) => ["submissionsPage", "contactPage", "footer"].includes(schemaType)
      ? actions.filter(({ action }) => action !== "duplicate" && action !== "delete")
      : actions
  }
});
