import { readFile } from "node:fs/promises";
import { getCliClient } from "sanity/cli";

try {
  const client = getCliClient({ apiVersion: "2026-07-09" });
  const document = JSON.parse(await readFile(new URL("../src/sanity/lib/footerDefaults.json", import.meta.url), "utf8"));
  const existing = await client.fetch('*[_id in ["footer", "drafts.footer"]]{_id}', {}, { perspective: "raw" });
  const isWrite = process.argv.includes("--write");
  console.log(JSON.stringify({ mode: isWrite ? "write" : "dry-run", existing, create: !existing.length }, null, 2));
  if (isWrite && !existing.length) {
    await client.createIfNotExists(document);
    const saved = await client.fetch('*[_id == "footer"][0]{_id, "navigation": count(navigation), "socialLinks": count(socialLinks), "paragraphs": count(submissionsCopy)}');
    console.log("Imported footer:", JSON.stringify(saved, null, 2));
  }
} catch (error) {
  console.error("Footer import failed:", error.message);
  process.exitCode = 1;
}
