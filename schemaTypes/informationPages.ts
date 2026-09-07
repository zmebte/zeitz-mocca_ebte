import { defineArrayMember, defineField, defineType } from "sanity";
import defaults from "../src/sanity/lib/informationPageDefaults.json";

export const informationPages = (["submissionsPage", "contactPage"] as const).map((name) =>
  defineType({
    name,
    title: defaults[name].title,
    type: "document",
    initialValue: (() => {
      const { _id, _type, ...content } = defaults[name];
      return content;
    })(),
    fields: [
      defineField({ name: "title", title: "Page title", type: "string", validation: (rule) => rule.required() }),
      defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 3 }),
      defineField({
        name: "intro",
        title: "Introductory text",
        description: "Edit the paragraphs, emphasis and links, including the contact email address.",
        type: "array",
        of: [defineArrayMember({
          type: "block",
          styles: [{ title: "Paragraph", value: "normal" }],
          lists: [],
          marks: {
            decorators: [{ title: "Emphasis", value: "em" }, { title: "Strong", value: "strong" }],
            annotations: [defineArrayMember({
              name: "link",
              title: "Link",
              type: "object",
              fields: [defineField({
                name: "href", title: "URL", type: "url",
                validation: (rule) => rule.required().uri({ scheme: ["http", "https", "mailto", "tel"], allowRelative: true })
              })]
            })]
          }
        })],
        validation: (rule) => rule.required().min(1)
      }),
      ...(name === "submissionsPage" ? [defineField({
        name: "guidelines",
        title: "Submission guidelines",
        description: "Add, edit or reorder the bullet points.",
        type: "array",
        of: [defineArrayMember({
          name: "guideline", title: "Guideline", type: "object",
          fields: [defineField({ name: "text", title: "Text", type: "text", rows: 4, validation: (rule) => rule.required() })],
          preview: { select: { title: "text" } }
        })],
        validation: (rule) => rule.required().min(1)
      })] : [])
    ],
    preview: { select: { title: "title" } }
  })
);
