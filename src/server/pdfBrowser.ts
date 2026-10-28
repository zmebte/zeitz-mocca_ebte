import puppeteer, { type Browser, type LaunchOptions } from "puppeteer";
import chromium from "@sparticuz/chromium";

let executablePathPromise: Promise<string> | null = null;

async function getServerlessExecutablePath(): Promise<string> {
  // Concurrent requests must not launch a partially extracted binary.
  const pending = executablePathPromise ??= chromium.executablePath();
  try {
    return await pending;
  } catch (error) {
    if (executablePathPromise === pending) executablePathPromise = null;
    throw error;
  }
}

export async function launchPdfBrowser(): Promise<Browser> {
  const isVercel = Boolean(process.env.VERCEL);
  const launchOptions: LaunchOptions = isVercel
    ? {
        args: chromium.args,
        executablePath: await getServerlessExecutablePath(),
        headless: "shell"
      }
    : {
        headless: true
      };

  return puppeteer.launch(launchOptions);
}
