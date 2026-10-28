import type { APIRoute } from "astro";
import { perspectiveCookieName } from "@sanity/preview-url-secret/constants";
import { cleanString } from "../../../../sanity/lib/clean";
import { loadArticleBySlug } from "../../../../sanity/lib/loadArticleBySlug";
import { getPdfBrowser } from "../../../../server/pdfBrowser";

export const prerender = false;

const HEADER_TEMPLATE = `
  <div></div>
`;

const FOOTER_TEMPLATE = `
  <div style="width: 100%; display: flex; justify-content: space-between; font-family: 'Courier New', Courier, monospace; font-size: 8px; padding: 0 28pt; color: #555;">
    <span>EVERYTHING BUT THE EXHIBITION</span>
    <span><span class="pageNumber"></span>&nbsp;/&nbsp;<span class="totalPages"></span></span>
  </div>
`;

function slugifyFilename(value: string) {
  const cleaned = value.trim().toLowerCase();
  return cleaned.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "article";
}

const generatePdf: APIRoute = async ({ params, cookies, url }) => {
  const slug = cleanString(params.slug);

  if (!slug) {
    return new Response("Not found", { status: 404 });
  }

  const article = await loadArticleBySlug(slug, cookies);

  if (!article) {
    return new Response("Article not found", { status: 404 });
  }

  const browser = await getPdfBrowser();
  // Isolate preview cookies from other downloads using the shared browser.
  const context = await browser.createBrowserContext();

  try {
    const perspective = cookies.get(perspectiveCookieName)?.value;
    if (perspective) {
      await context.setCookie({
        name: perspectiveCookieName,
        value: encodeURIComponent(perspective),
        domain: url.hostname,
        path: "/",
        secure: url.protocol === "https:",
        httpOnly: true,
        sameSite: "Lax"
      });
    }

    const page = await context.newPage();
    const printUrl = new URL(`/articles/${encodeURIComponent(slug)}/print`, url.origin);
    const printResponse = await page.goto(printUrl.toString(), { waitUntil: "networkidle0" });
    if (!printResponse?.ok()) {
      return new Response("The article print page could not be loaded.", { status: 502 });
    }
    await page.evaluate(() => document.fonts.ready);

    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: HEADER_TEMPLATE,
      footerTemplate: FOOTER_TEMPLATE
    });

    const filename = `${slugifyFilename(cleanString(article.title) || slug)}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } finally {
    await context.close();
  }
};

export const GET: APIRoute = async (context) => {
  try {
    return await generatePdf(context);
  } catch (error) {
    console.error("[article-pdf] PDF generation failed", {
      slug: context.params.slug,
      error
    });
    return new Response("The PDF could not be generated. Please try again.", {
      status: 500,
      headers: { "Cache-Control": "no-store" }
    });
  }
};
