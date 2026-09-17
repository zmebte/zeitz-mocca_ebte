import { defineMiddleware } from "astro:middleware";
import { isInternalSearchRoute } from "./lib/seo";
import { getDraftModeProps } from "./sanity/lib/draft-mode";

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const draftMode = Boolean(getDraftModeProps(context.cookies).perspectiveCookie);
  if (draftMode || isInternalSearchRoute(context.url.pathname)) {
    // Headers also cover PDFs, which cannot carry an HTML robots meta tag.
    response.headers.set("X-Robots-Tag", "noindex, follow");
  }
  if (draftMode) response.headers.set("Cache-Control", "private, no-store");
  return response;
});
