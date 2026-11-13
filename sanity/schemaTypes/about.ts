import { defineType } from "sanity";

export const LINK_EXTERNAL_ONLY = (Rule: any) =>
    Rule.uri({ scheme: ['http', 'https'] }).error("Use a valid HTTP/HTTPS URL")

export const about = defineType({
    name: "about",
    title: "Daniel Wijaya",
    type: "document",
    fields: [
        {
            name: "heading",
            title: "Heading",
            description: "Displayed at about page and site metadata",
            type: "text",
        },

        {
            name: "subheading",
            title: "Subheading",
            description: "Displayed at about page",
            type: "array",
            of: [
                {
                    type: "block",
                    marks: {
                        annotations: [
                            {
                                name: "link",
                                title: "Link",
                                type: "object",
                                fields: [
                                    {
                                        name: "href",
                                        title: "URL",
                                        type: "url",
                                        validation: (Rule) =>
                                            Rule.uri({
                                                allowRelative: true,
                                            }),
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
        },

        {
            name: "about",
            title: "Biography",
            description: "Displayed at home page",
            type: "array",
            of: [
                {
                    type: "block",
                    marks: {
                        annotations: [
                            {
                                name: "link",
                                title: "Link",
                                type: "object",
                                fields: [
                                    {
                                        name: "href",
                                        title: "URL",
                                        type: "url",
                                        validation: (Rule) =>
                                            Rule.uri({
                                                allowRelative: true,
                                            }),
                                    },
                                ],
                            },
                        ],
                    },
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
                        { name: "url", title: "Company URL", type: "url", validation: LINK_EXTERNAL_ONLY },
                        { name: "role", title: "Role", type: "string" },
                        { name: "year", title: "Year", type: "string" },
                    ],
                },
            ],
        },

        {
            name: "stacks",
            title: "Stacks",
            type: "array",
            of: [{ type: "string" }],
        },

        {
            name: "contact",
            title: "Contact",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        {
                            name: "title",
                            title: "Title",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: "subtitle",
                            title: "Subtitle",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        },
                    ],
                    preview: {
                        select: {
                            title: "title",
                            subtitle: "subtitle",
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
        },

        {
            name: "software",
            title: "Software",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        {
                            name: "title",
                            title: "Title",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: "link",
                            title: "Link",
                            type: "url",
                            validation: LINK_EXTERNAL_ONLY,
                        },
                        {
                            name: "description",
                            title: "Description",
                            type: "text",
                            validation: (Rule) => Rule.required().custom((value) => {
                                if (!value || typeof value !== "string") return true;
                                const wordCount = value.trim().split(/\s+/).length;
                                return wordCount <= 24 || `Description must be 24 words or fewer (currently ${wordCount} words)`;
                            }),
                        },
                    ],
                    preview: {
                        select: {
                            title: "title",
                            subtitle: "description",
                        },
                    },
                },
            ],
        },

        {
            name: "hardware",
            title: "Hardware",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        {
                            name: "title",
                            title: "Title",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: "link",
                            title: "Link",
                            type: "url",
                            validation: LINK_EXTERNAL_ONLY,
                        },
                        {
                            name: "description",
                            title: "Description",
                            type: "text",
                            validation: (Rule) => Rule.required().custom((value) => {
                                if (!value || typeof value !== "string") return true;
                                const wordCount = value.trim().split(/\s+/).length;
                                return wordCount <= 24 || `Description must be 24 words or fewer (currently ${wordCount} words)`;
                            }),
                        },
                    ],
                    preview: {
                        select: {
                            title: "title",
                            subtitle: "description",
                        },
                    },
                },
            ],
        },

        {
            name: "funFacts",
            title: "Fun Facts",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        {
                            name: "title",
                            title: "Title",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: "description",
                            title: "Description",
                            validation: (Rule) => Rule.required(),
                            type: "array",
                            of: [
                                {
                                    type: "block",
                                    marks: {
                                        annotations: [
                                            {
                                                name: "link",
                                                title: "Link",
                                                type: "object",
                                                fields: [
                                                    {
                                                        name: "href",
                                                        title: "URL",
                                                        type: "url",
                                                        validation: (Rule) =>
                                                            Rule.uri({
                                                                allowRelative: true,
                                                            }),
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                    preview: {
                        select: {
                            title: "title",
                            subtitle: "description",
                        },
                    },
                },
            ],
        },
    ],

    preview: {
        prepare() {
            return {
                title: "Daniel Wijaya's Biodata",
            };
        },
    },
});