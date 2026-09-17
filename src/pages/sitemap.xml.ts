import type { APIRoute } from "astro";
import { defineQuery } from "groq";
import { isFeatureEnabled } from "../lib/featureFlags";
import { articleCategories, canonicalUrl, renderSitemap } from "../lib/seo";
import { loadQuery } from "../sanity/lib/load-query";

export const prerender = false;

const sitemapArticlesQuery = defineQuery(`
  *[_type == "article" && defined(slug.current) && slug.current != ""]
    | order(slug.current asc) { "slug": slug.current, _updatedAt }
`);

export const GET: APIRoute = async ({ site }) => {
  try {
    // Deliberately omit preview cookies: sitemaps must only contain published content.
    const { data: articles } = await loadQuery<{ slug: string; _updatedAt: string }[]>({
      query: sitemapArticlesQuery
    });
    const paths = ["/", "/articles", "/contact", "/submissions",
      ...articleCategories.map((category) => `/articles?category=${category}`)];
    if (isFeatureEnabled("authorsIndex")) paths.push("/authors");

    const entries = paths.map((path) => ({ url: canonicalUrl(new URL(path, site), site!) }));
    const articleEntries = articles.map((article) => ({
      url: canonicalUrl(new URL(`/articles/${encodeURIComponent(article.slug)}`, site), site!),
      lastModified: article._updatedAt
    }));

    return new Response(renderSitemap([...entries, ...articleEntries]), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=300"
      }
    });
  } catch (error) {
    console.error("Sitemap generation failed.", error);
    // Do not replace a good sitemap with a partial one when the CMS is unavailable.
    return new Response("Sitemap temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "300" }
    });
  }
};
