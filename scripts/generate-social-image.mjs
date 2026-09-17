import { readFile, mkdir } from "node:fs/promises";
import puppeteer from "puppeteer";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const font = await readFile(new URL("public/fonts/webfonts/texgyretermes-regular.woff2", root));
const browser = await puppeteer.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: Termes; src: url(data:font/woff2;base64,${font.toString("base64")}) format("woff2"); }
    * { box-sizing: border-box; }
    body { margin: 0; width: 1200px; height: 630px; background: #f4f1eb; color: #171717; padding: 52px 64px; display: flex; flex-direction: column; }
    header, footer { font: 20px Arial, sans-serif; letter-spacing: 2px; text-transform: uppercase; }
    header { border-bottom: 1px solid; padding-bottom: 22px; }
    h1 { font: 106px/0.98 Termes, serif; letter-spacing: -3px; margin: auto 0; }
    footer { border-top: 1px solid; padding-top: 22px; display: flex; justify-content: space-between; font-size: 16px; }
  </style></head><body><header>Zeitz MOCAA</header>
    <h1>Everything but<br>the Exhibition</h1>
    <footer><span>Process Notes / Foot Notes / Voice Notes</span><span>ebte.zeitzmocaa.art</span></footer>
  </body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await mkdir(new URL("public/images/", root), { recursive: true });
  await page.screenshot({ path: fileURLToPath(new URL("public/images/social-default.png", root)) });
} finally {
  await browser.close();
}
