import type { AstroCookies } from "astro";
import defaults from "./informationPageDefaults.json";
import { getDraftModeProps } from "./draft-mode";
import { loadQuery } from "./load-query";
import { informationPageQuery } from "./queries";
import type { PortableTextBlock } from "./types";

export interface InformationPage {
  _id: string;
  title: string;
  seoDescription?: string;
  intro: PortableTextBlock[];
  guidelines?: { _key: string; text: string }[];
}

export async function loadInformationPage(id: keyof typeof defaults, cookies: AstroCookies): Promise<InformationPage> {
  const fallback = defaults[id] as InformationPage;
  try {
    const { data } = await loadQuery<InformationPage | null>({
      query: informationPageQuery,
      params: { id },
      ...getDraftModeProps(cookies)
    });
    return data ? {
      ...data,
      title: data.title ?? fallback.title,
      intro: data.intro ?? fallback.intro,
      guidelines: data.guidelines ?? fallback.guidelines
    } : fallback;
  } catch (error) {
    console.error(`Sanity ${id} fetch failed, using the original page copy.`, error);
    return fallback;
  }
}
