# Everything but the Exhibition

Production repository for the Everything but the Exhibition editorial site.

The site is built with Astro, served with the Vercel adapter, and powered by Sanity for structured editorial content. The Sanity Studio is embedded at `/studio`, and articles can be exported as print-ready PDFs from the frontend.

## Production Stack

- Astro server output with `@astrojs/vercel`
- Sanity Content Lake and embedded Sanity Studio
- Sanity Presentation Tool and draft mode
- Vanilla browser JavaScript for small interactions
- Puppeteer plus `@sparticuz/chromium` for production PDF generation
- Open Remark embed support for article comments

## Key Routes

- `/` - homepage
- `/articles` - article index
- `/articles/[slug]` - article page
- `/articles/[slug]/print` - print HTML used for PDF generation
- `/api/articles/[slug]/pdf` - generated PDF endpoint
- `/articles/print-preview` - internal print layout preview tool
- `/studio` - embedded Sanity Studio
- `/api/draft-mode/enable` - Sanity preview entry point
- `/api/draft-mode/disable` - exits draft mode

## Environment Variables

Set these in Vercel and in local `.env` files as needed.

```bash
PUBLIC_SANITY_PROJECT_ID=p7t0rr17
PUBLIC_SANITY_DATASET=production
PUBLIC_OPEN_REMARK_SITE_KEY=
PUBLIC_ENABLE_AUTHORS_INDEX=false
SANITY_API_READ_TOKEN=
SANITY_STUDIO_PREVIEW_URL=https://your-production-domain
SANITY_STUDIO_URL=https://your-production-domain/studio
```

`PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` default to the production Sanity project if omitted, but production should still define them explicitly.

`PUBLIC_OPEN_REMARK_SITE_KEY` is required only for articles that include a comments section.

`PUBLIC_ENABLE_AUTHORS_INDEX=true` enables the authors index page and menu item. Leave it unset or set it to `false` to hide `/authors` from production while it is still in progress.

`SANITY_API_READ_TOKEN` is used for draft-mode reads and private preview access.

`SANITY_STUDIO_PREVIEW_URL` should point to the deployed frontend URL. `SANITY_STUDIO_URL` should point to the deployed Studio route.

## Search indexing

Public pages include Open Graph and Twitter large-image card metadata using their page
titles, descriptions, and canonical URLs. Articles use their Sanity cover image resized
to a 1200×630 JPEG; pages without a cover use `public/images/social-default.png`.
Regenerate the branded fallback with `node scripts/generate-social-image.mjs`.

The production origin is configured as `https://ebte.zeitzmocaa.art` in `astro.config.mjs`.
The shared page layout emits canonical URLs on that origin, discarding tracking parameters
while retaining valid article category filters.

`/sitemap.xml` fetches published article slugs from Sanity on demand (with a five-minute
shared cache), alongside public pages and category indexes. The authors index is included
only when its feature flag is enabled. CMS failures return 503 rather than a partial sitemap.
`/robots.txt` advertises the sitemap and permits crawling so Google can read indexing headers.

Middleware sends `X-Robots-Tag: noindex, follow` for print HTML, PDF downloads, print preview,
Studio, draft-mode endpoints, and responses viewed with a draft-mode cookie. Draft responses
are also marked private and non-cacheable. These controls do not replace authentication.

After deployment, submit `https://ebte.zeitzmocaa.art/sitemap.xml` in Google Search Console
and inspect a public article URL. Indexing changes take effect after Google recrawls the site.

Run the focused SEO regression checks with `node --experimental-strip-types scripts/check-seo.mjs`
(Node 22.6+).

## Feature Flags

Feature flags live in `src/lib/featureFlags.ts`. They are intended for hiding in-progress routes and navigation items without deleting the underlying page.

To add another flagged page:

1. Add a key and env var to `featureFlagEnvVars`.
2. Add `featureFlag: "yourFlag"` to any nav link that should be hidden.
3. Add an early redirect or 404 in the page frontmatter when the flag is disabled.

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Run the frontend and embedded Studio:

```bash
npm run dev
```

Open `http://localhost:4321`.

The Studio can also be run directly:

```bash
npm run studio
```

## Production Build

Run the Astro production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Build the Sanity Studio bundle:

```bash
npm run studio:build
```

Deploy the standalone Sanity Studio if needed:

```bash
npm run studio:deploy
```

## Deployment

The app is configured for Vercel in `astro.config.mjs`:

```js
output: "server",
adapter: vercel()
```

Use Vercel as the production host. The server output is required for article routes, draft mode, and PDF generation.

Before deploying, confirm:

- Vercel environment variables match production Sanity settings.
- Sanity CORS allows the production domain.
- Sanity Presentation preview URLs point to the production domain.
- PDF generation works from `/api/articles/[slug]/pdf`.
- Comments render on articles with `commentsSection` when `PUBLIC_OPEN_REMARK_SITE_KEY` is set.

## Editorial Model

Articles are built from the `contentSections` array on the `article` document. Each section maps to an Astro component.

Supported article sections include:

- Rich text
- Pull quotes
- Share clippings
- Feature cards
- Related reading
- Images with formatted captions
- Audio
- Video
- Comments
- Dividers

Read time is calculated on the frontend from article content and is not authored manually.

## PDF Workflow

The PDF button loads `/api/articles/[slug]/pdf`. That endpoint opens the print route in Puppeteer and returns a generated PDF.

The print layout can be checked in HTML at:

```text
/articles/[slug]/print
```

The print preview tool is available at:

```text
/articles/print-preview
```

Use the preview route for layout and baseline-grid CSS adjustments before testing the generated PDF.

## Sanity Notes

The canonical Studio setup is in:

- `sanity.config.ts`
- `sanity.cli.ts`
- `schemaTypes/`
- `src/sanity/lib/queries.ts`

When changing Sanity schemas, also check frontend projections and TypeScript interfaces in `src/sanity/lib`.

## Maintenance Checks

Before production release, run:

```bash
npm run build
npm run studio:build
```

Use `npm run check` when touching Astro templates or TypeScript-heavy code.
