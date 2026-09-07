import { defineDocuments, defineLocations } from "sanity/presentation";
import type { PresentationPluginOptions } from "sanity/presentation";

export const resolve: PresentationPluginOptions["resolve"] = {
  mainDocuments: defineDocuments([
    { route: "/submissions", filter: `_type == "submissionsPage" && _id == "submissionsPage"` },
    { route: "/contact", filter: `_type == "contactPage" && _id == "contactPage"` },
    {
      route: "/",
      filter: `_type == "homePage" && _id == "homePage"`
    },
    {
      route: "/articles/:slug",
      filter: `_type == "article" && slug.current == $slug`
    }
  ]),
  locations: {
    footer: defineLocations({
      locations: [{ title: "Home Page footer", href: "/" }, { title: "Index footer", href: "/articles" }]
    }),
    submissionsPage: defineLocations({
      select: { title: "title" },
      resolve: (doc) => ({ locations: [{ title: doc?.title || "Submissions", href: "/submissions" }] })
    }),
    contactPage: defineLocations({
      select: { title: "title" },
      resolve: (doc) => ({ locations: [{ title: doc?.title || "Contact", href: "/contact" }] })
    }),
    homePage: defineLocations({
      select: {
        title: "headerTitle"
      },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || "Home Page",
            href: "/"
          }
        ]
      })
    }),
    article: defineLocations({
      select: {
        title: "title",
        slug: "slug.current"
      },
      resolve: (doc) => ({
        locations: doc?.slug
          ? [
              {
                title: doc.title || "Untitled article",
                href: `/articles/${doc.slug}`
              },
              {
                title: "Index",
                href: "/"
              }
            ]
          : []
      })
    })
  }
};
