import puppeteer, { type Browser, type LaunchOptions } from "puppeteer";
import chromium from "@sparticuz/chromium";

let browserPromise: Promise<Browser> | null = null;

async function launchPdfBrowser(): Promise<Browser> {
  const isVercel = Boolean(process.env.VERCEL);
  const launchOptions: LaunchOptions = isVercel
    ? {
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: "shell"
      }
    : {
        headless: true
      };

  return puppeteer.launch(launchOptions);
}

export async function getPdfBrowser(): Promise<Browser> {
  // Cache extraction as well as launch so concurrent cold requests share both.
  const pending = browserPromise ??= launchPdfBrowser();
  let browser: Browser;
  try {
    browser = await pending;
  } catch (error) {
    // A failed launch must not poison every subsequent request in this instance.
    if (browserPromise === pending) browserPromise = null;
    throw error;
  }

  if (!browser.connected) {
    if (browserPromise === pending) browserPromise = null;
    return getPdfBrowser();
  }
  return browser;
}
