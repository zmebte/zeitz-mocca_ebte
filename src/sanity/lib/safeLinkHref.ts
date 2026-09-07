import { cleanString } from "./clean";

export function safeLinkHref(value: string | null | undefined) {
  const href = cleanString(value).trim();
  if (!href || /[\u0000-\u0020\u007f\\]/.test(href)) return "";
  if (/^(?:https?:\/\/|mailto:|tel:)/i.test(href)) return href;
  if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith("//")) return "";
  return href;
}
