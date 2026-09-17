import assert from "node:assert/strict";
import { canonicalUrl, isInternalSearchRoute, renderSitemap } from "../src/lib/seo.ts";

const site = new URL("https://ebte.zeitzmocaa.art/");
assert.equal(canonicalUrl(new URL("https://preview.example/articles/test/?utm_source=email#intro"), site),
  "https://ebte.zeitzmocaa.art/articles/test");
assert.equal(canonicalUrl(new URL("https://preview.example/articles?utm_source=email&category=foot-note"), site),
  "https://ebte.zeitzmocaa.art/articles?category=foot-note");
assert.equal(canonicalUrl(new URL("https://preview.example/articles?category=unknown"), site),
  "https://ebte.zeitzmocaa.art/articles");
assert.equal(canonicalUrl(new URL("https://preview.example/?category=foot-note"), site), site.href);

for (const path of ["/articles/test/print", "/articles/test/print/", "/api/articles/test/pdf",
  "/studio", "/studio/structure", "/articles/print-preview", "/api/draft-mode/enable"]) {
  assert.ok(isInternalSearchRoute(path), `Expected noindex: ${path}`);
}
for (const path of ["/", "/articles", "/articles/test", "/contact", "/submissions", "/authors"]) {
  assert.equal(isInternalSearchRoute(path), false, `Must remain indexable: ${path}`);
}

const xml = renderSitemap([
  { url: `${site}articles?a=1&b=2`, lastModified: "2026-09-17T00:00:00Z" },
  { url: `${site}articles?a=1&b=2`, lastModified: "2026-09-17T00:00:00Z" },
  { url: site.href, lastModified: "invalid" }
]);
assert.ok(xml.includes("?a=1&amp;b=2"));
assert.equal((xml.match(/<url>/g) || []).length, 2);
assert.equal((xml.match(/<lastmod>/g) || []).length, 1);
assert.ok(xml.includes("2026-09-17T00:00:00.000Z"));
console.log("SEO checks passed: canonical URLs, indexing boundaries, sitemap XML and dates.");
