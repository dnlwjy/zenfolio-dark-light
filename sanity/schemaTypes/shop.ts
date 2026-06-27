import { defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

export const products = defineType({
  name: "shop",
  title: "Builds",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "shop" }),
    { name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
    { name: "coverImage", title: "Cover Image", type: "image", description: "Accepts static images or GIFs. Used for social media preview (recommended 1200x630)", validation: (Rule) => Rule.required() },
    {
      name: "description",
      title: "Description",
      type: "string",
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value || typeof value !== "string") return true;
          const wordCount = value.trim().split(/\s+/).length;
          return wordCount <= 24 || `Description must be 24 words or fewer (currently ${wordCount} words)`;
        }),
    },
    {
      name: "year",
      title: "Year",
      type: "number",
      validation: (Rule) => Rule.required().integer().min(2000).error("Year is required"),
    },
    { name: "preview", title: "Preview", type: "url", validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }) },
    {
      name: "marketplaceURL",
      title: "Marketplace URL",
      type: "url",
      description: "External link to the product on its marketplace (e.g. Framer, ThemeForest, etc)",
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
    },
    {
      name: "marketplaceName",
      title: "Marketplace Name",
      type: "string",
    },
    {
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Mark this item as featured. Only one item can be featured at a time.",
      validation: (Rule) =>
        Rule.custom(async (value, context) => {
          if (!value) return true;
          const { document, getClient } = context as any;
          const client = getClient({ apiVersion: "2024-01-01" });
          const existingId = await client.fetch(
            `*[_type == "shop" && featured == true && _id != $id && !(_id in path("drafts.**"))][0]._id`,
            { id: document?._id?.replace(/^drafts\./, "") }
          );
          return existingId ? "Only one item can be featured at a time. Remove featured from the existing item first." : true;
        }),
    },
  ],
});