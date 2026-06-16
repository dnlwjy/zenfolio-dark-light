import { defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

export const uses = defineType({
    name: "uses",
    title: "Uses",
    type: "document",
    orderings: [orderRankOrdering],
    fields: [
        orderRankField({ type: "uses" }),
        { name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() },
        { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
        {
            name: "content", title: "Content", type: "array", of: [
                { type: "block" },
                {
                    type: "object", name: "link", fields: [
                        { name: "text", type: "string", title: "Link Text" },
                        { name: "href", type: "url", title: "URL" },
                    ],
                },
            ],
        },
    ],
});