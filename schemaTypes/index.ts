import { article } from "./article.ts";
import { articleIndexSection } from "./articleIndexSection.ts";
import { audioPlayerSection } from "./audioPlayerSection.ts";
import { author } from "./author.ts";
import { categoryCardsSection } from "./categoryCardsSection.ts";
import { commentsSection } from "./commentsSection.ts";
import { dividerSection } from "./dividerSection.ts";
import { imageSection } from "./imageSection.ts";
import { homeFeaturedArticleSection } from "./homeFeaturedArticleSection.ts";
import { homeHeaderSection } from "./homeHeaderSection.ts";
import { homePage } from "./homePage.ts";
import { informationPages } from "./informationPages.ts";
import { footer, footerLink } from "./footer.ts";
import { homeQuoteSection } from "./homeQuoteSection.ts";
import { homeSplitFeatureSection } from "./homeSplitFeatureSection.ts";
import { portableText } from "./portableText.ts";
import { pullQuoteSection } from "./pullQuoteSection.ts";
import { relatedReadingSection } from "./relatedReadingSection.ts";
import { richTextSection } from "./richTextSection.ts";
import { tag } from "./tag.ts";
import { videoSection } from "./videoSection.ts";

export const schemaTypes = [
  homePage,
  ...informationPages,
  footer,
  footerLink,
  article,
  articleIndexSection,
  categoryCardsSection,
  homeHeaderSection,
  homeFeaturedArticleSection,
  homeSplitFeatureSection,
  homeQuoteSection,
  audioPlayerSection,
  videoSection,
  author,
  tag,
  portableText,
  richTextSection,
  pullQuoteSection,
  relatedReadingSection,
  imageSection,
  commentsSection,
  dividerSection
];
