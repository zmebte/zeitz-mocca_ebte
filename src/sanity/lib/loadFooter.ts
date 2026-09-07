import type { AstroCookies } from "astro";
import defaults from "./footerDefaults.json";
import { getDraftModeProps } from "./draft-mode";
import { loadQuery } from "./load-query";
import { footerQuery } from "./queries";
import type { PortableTextBlock } from "./types";

export interface FooterLink {
  _key?: string;
  label: string;
  href: string;
}

export interface Footer {
  _id: string;
  navigation?: FooterLink[];
  socialLinks?: FooterLink[];
  submissionsTitle: string;
  submissionsCopy: PortableTextBlock[];
  submitLink?: FooterLink;
}

export async function loadFooter(cookies: AstroCookies): Promise<Footer> {
  try {
    const { data } = await loadQuery<Footer | null>({
      query: footerQuery,
      ...getDraftModeProps(cookies)
    });
    // Missing arrays on an existing document mean the editor removed all links.
    return data ?? defaults as Footer;
  } catch (error) {
    console.error("Sanity footer fetch failed, using the original footer.", error instanceof Error ? error.message : "Unknown error");
    return defaults as Footer;
  }
}
