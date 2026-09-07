import { safeLinkHref } from "./safeLinkHref";
import type { PortableTextBlock, PortableTextMarkDef } from "./types";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function wrapMarks(text: string, marks: string[] = [], markDefs: PortableTextMarkDef[] = [], openLinksInNewTab = true) {
  return marks.reduce((output, mark) => {
    if (mark === "strong") {
      return `<strong>${output}</strong>`;
    }
    if (mark === "em") {
      return `<em>${output}</em>`;
    }
    const definition = markDefs.find((item) => item._key === mark);
    if (definition?._type === "link") {
      const href = safeLinkHref(definition.href);
      if (!href) {
        return output;
      }
      return `<a href="${escapeHtml(href)}"${openLinksInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""}>${output}</a>`;
    }
    return output;
  }, text);
}

export function renderInlinePortableText(blocks: PortableTextBlock[] | null = [], openLinksInNewTab = true) {
  return (blocks || [])
    .map((block) =>
      block.children
        ?.map((child) => wrapMarks(escapeHtml(child.text), child.marks, block.markDefs, openLinksInNewTab))
        .join("")
    )
    .filter(Boolean)
    .join("<br>");
}

export function portableTextToPlainText(blocks: PortableTextBlock[] | null = []) {
  return (blocks || [])
    .map((block) => block.children?.map((child) => child.text || "").join("") || "")
    .filter(Boolean)
    .join(" ");
}
