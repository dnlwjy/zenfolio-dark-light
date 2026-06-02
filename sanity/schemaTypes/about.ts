import { defineType } from "sanity";

export const about = defineType({
    name: "about",
    title: "Daniel Wijaya",
    type: "document",
    fields: [
        {
            name: "heading",
            title: "Heading",
            type: "text",
            description: "Displayed at the about page, and could be used as a site metadata",
        },

        {
            name: "about", title: "About", type: "array", description: "Displayed at the home page", of: [
                { type: "block" },
                {
                    type: "object", name: "link", fields: [
                        { name: "text", type: "string", title: "Link Text" },
                        { name: "href", type: "url", title: "URL" },
                    ],
                },
            ],
        },

        {
            name: "experiences",
            title: "Experiences",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "company", title: "Company", type: "string" },
                        { name: "url", title: "Company URL", type: "url", validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }).error("Only valid HTTP or HTTPS URLs are allowed") },
                        { name: "role", title: "Role", type: "string" },
                        { name: "year", title: "Year", type: "string" },
                    ],
                },
            ],
        },

        {
            name: "skills",
            title: "Skills",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        {
                            name: "category",
                            title: "Category",
                            type: "string",
                            options: {
                                list: [
                                    { title: "Tools", value: "tools" },
                                    { title: "Stacks", value: "stacks" },
                                ],
                            },
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: "items",
                            title: "Items",
                            type: "array",
                            of: [{ type: "string" }],
                        },
                    ],
                    preview: {
                        select: {
                            title: "category",
                        },
                    },
                },
            ],
        },

        {
            name: "clients",
            title: "Clients / Brands",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        {
                            name: "name",
                            type: "string",
                        },
                        {
                            name: "svg",
                            type: "text",
                        },
                    ],
                },
            ],
        }
    ],

    preview: {
        prepare() {
            return {
                title: "Daniel Wijaya's Biodata",
            };
        },
    },
});