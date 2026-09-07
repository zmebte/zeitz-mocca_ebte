import type { StructureResolver } from "sanity/structure";

const hiddenTypes = ["homePage", "submissionsPage", "contactPage", "footer", "media.tag"];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Website Content")
    .items([
      S.listItem()
        .title("Home Page")
        .child(
          S.document()
            .schemaType("homePage")
            .documentId("homePage")
            .title("Home Page")
        ),
      ...([ ["submissionsPage", "Submissions"], ["contactPage", "Contact"], ["footer", "Footer"] ] as const).map(([type, title]) =>
        S.listItem().title(title).child(S.document().schemaType(type).documentId(type).title(title))
      ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem) => !hiddenTypes.includes(listItem.getId() || "")
      )
    ]);
