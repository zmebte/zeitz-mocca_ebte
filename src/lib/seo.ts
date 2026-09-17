export const articleCategories = ["process-note", "foot-note", "voice-note"] as const;

/** Keep meaningful category filters; discard tracking and preview parameters. */
export function canonicalUrl(url: URL, site: URL): string {
  const canonical = new URL(site);
  canonical.pathname = url.pathname.replace(/\/+$/, "") || "/";
  canonical.search = "";
  canonical.hash = "";
  const category = url.searchParams.get("category");
  if (canonical.pathname === "/articles" && articleCategories.some((value) => value === category)) {
    canonical.searchParams.set("category", category!);
  }
  return canonical.href;
}

export function isInternalSearchRoute(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "");
  return path === "/studio" || path.startsWith("/studio/") ||
    path === "/articles/print-preview" ||
    /^\/articles\/[^/]+\/print$/.test(path) ||
    /^\/api\/articles\/[^/]+\/pdf$/.test(path) ||
    path.startsWith("/api/draft-mode/");
}

export interface SitemapEntry {
  url: string;
  lastModified?: string;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function renderSitemap(entries: SitemapEntry[]): string {
  const uniqueEntries = new Map(entries.map((entry) => [entry.url, entry]));
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    [...uniqueEntries.values()].map(({ url, lastModified }) => {
      const date = lastModified ? new Date(lastModified) : null;
      const lastmod = date && !Number.isNaN(date.getTime())
        ? `<lastmod>${date.toISOString()}</lastmod>` : "";
      return `  <url><loc>${escapeXml(url)}</loc>${lastmod}</url>`;
    }).join("\n") + '\n</urlset>\n';
}
