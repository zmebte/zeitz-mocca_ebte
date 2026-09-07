import { readFile } from "node:fs/promises";
import { getCliClient } from "sanity/cli";

try {
  const client = getCliClient({ apiVersion: "2026-07-09" });
  const defaults = JSON.parse(await readFile(new URL("../src/sanity/lib/informationPageDefaults.json", import.meta.url), "utf8"));
  const documents = Object.values(defaults);
  const existing = await client.fetch('*[_id in $ids]{_id}', {
    ids: documents.flatMap(({ _id }) => [_id, `drafts.${_id}`])
  }, { perspective: "raw" });
  const missing = documents.filter(({ _id }) => !existing.some((doc) => doc._id === _id || doc._id === `drafts.${_id}`));
  console.log(JSON.stringify({ mode: process.argv.includes("--write") ? "write" : "dry-run", create: missing.map(({ _id }) => _id), existing: existing.map(({ _id }) => _id) }, null, 2));

  if (process.argv.includes("--write") && missing.length) {
    let transaction = client.transaction();
    for (const document of missing) transaction = transaction.createIfNotExists(document);
    await transaction.commit();
    const saved = await client.fetch('*[_id in $ids]{_id, title, "paragraphs": count(intro), "guidelines": count(guidelines)}', { ids: missing.map(({ _id }) => _id) });
    console.log("Imported page copy:", JSON.stringify(saved, null, 2));
  }

} catch (error) {
  console.error("Page import failed:", error.message);
  process.exitCode = 1;
}
