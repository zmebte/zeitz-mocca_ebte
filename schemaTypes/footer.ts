import { defineArrayMember, defineField, defineType } from "sanity";
import defaults from "../src/sanity/lib/footerDefaults.json";

export const footerLink = defineType({
  name: "footerLink",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "href", title: "Destination", type: "url",
      description: "Use a page path such as /contact, or a full URL such as https://www.instagram.com/zeitzmocaa/.",
      validation: (rule) => rule.required().uri({ scheme: ["https", "http", "mailto", "tel"], allowRelative: true })
    })
  ],
  preview: { select: { title: "label", subtitle: "href" } }
});

const { _id, _type, ...initialValue } = defaults;

export const footer = defineType({
  name: "footer",
  title: "Footer",
  type: "document",
  initialValue,
  groups: [
    { name: "navigation", title: "Navigation", default: true },
    { name: "social", title: "Social links" },
    { name: "submissions", title: "Submissions" }
  ],
  fields: [
    defineField({
      name: "navigation", title: "Navigation links", type: "array", group: "navigation",
      description: "Drag links to reorder them. Add a label and destination to link to any existing page; adding a link does not create a page.",
      of: [defineArrayMember({ type: "footerLink" })]
    }),
    defineField({
      name: "socialLinks", title: "Social links", type: "array", group: "social",
      description: "Add, remove or drag links to change their order. Social links open in a new tab.",
      of: [defineArrayMember({ type: "footerLink" })]
    }),
    defineField({ name: "submissionsTitle", title: "Heading", type: "string", group: "submissions", validation: (rule) => rule.required() }),
    defineField({
      name: "submissionsCopy", title: "Submissions copy", type: "array", group: "submissions",
      of: [defineArrayMember({
        type: "block",
        styles: [{ title: "Paragraph", value: "normal" }],
        lists: [],
        marks: {
          decorators: [{ title: "Emphasis", value: "em" }, { title: "Strong", value: "strong" }],
          annotations: [defineArrayMember({
            name: "link", title: "Link", type: "object",
            fields: [defineField({
              name: "href", title: "Destination", type: "url",
              validation: (rule) => rule.required().uri({ scheme: ["https", "http", "mailto", "tel"], allowRelative: true })
            })]
          })]
        }
      })],
      validation: (rule) => rule.required().min(1)
    }),
    defineField({ name: "submitLink", title: "Submission button", type: "footerLink", group: "submissions", validation: (rule) => rule.required() })
  ],
  preview: { prepare: () => ({ title: "Footer" }) }
});
