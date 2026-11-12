import { defineType } from "sanity";

const ROUTE_HINT =
    "Contoh: / , /about , /case-study , /builds , /contact , /case-study/<slug> . Gunakan * untuk sapaan bawaan (fallback).";

export const chatbot = defineType({
    name: "chatbot",
    title: "Chatbot",
    type: "document",
    fields: [
        {
            name: "greetings",
            title: "Greetings per halaman",
            description: "Sapaan singkat yang muncul sekali per halaman. " + ROUTE_HINT,
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        {
                            name: "route",
                            title: "Route",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: "text",
                            title: "Teks sapaan",
                            type: "text",
                            rows: 2,
                            validation: (Rule) => Rule.required().max(160),
                        },
                    ],
                    preview: {
                        select: { title: "route", subtitle: "text" },
                    },
                },
            ],
        },
        {
            name: "suggestedQuestions",
            title: "Pertanyaan saran",
            description: "Maksimal 3 pertanyaan yang bisa diklik pengunjung. " + ROUTE_HINT,
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        {
                            name: "route",
                            title: "Route",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: "questions",
                            title: "Pertanyaan",
                            type: "array",
                            of: [{ type: "string" }],
                            validation: (Rule) => Rule.required().max(3).error("Maksimal 3 pertanyaan"),
                        },
                    ],
                    preview: {
                        select: { title: "route", subtitle: "questions" },
                    },
                },
            ],
        },
        {
            name: "faqs",
            title: "FAQ",
            description:
                "Jawaban lintas halaman (ketersediaan, cara kerja, dsb). Jawaban ini dipakai chatbot saat pertanyaan tidak terjawab oleh konten halaman.",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "question", title: "Pertanyaan", type: "string", validation: (Rule) => Rule.required() },
                        {
                            name: "answer",
                            title: "Jawaban",
                            type: "text",
                            rows: 4,
                            validation: (Rule) => Rule.required(),
                        },
                    ],
                    preview: { select: { title: "question", subtitle: "answer" } },
                },
            ],
        },
        {
            name: "escalation",
            title: "Eskalasi (WhatsApp)",
            type: "object",
            fields: [
                {
                    name: "triggers",
                    title: "Pemicu",
                    description: "Kata/frasa yang menandakan minat kerja sama. Contoh: hire, project, rate, quote, available.",
                    type: "array",
                    of: [{ type: "string" }],
                },
                {
                    name: "message",
                    title: "Teks penawaran",
                    description: "Teks yang muncul sebelum tombol WhatsApp.",
                    type: "text",
                    rows: 2,
                },
                {
                    name: "waMessageTemplate",
                    title: "Template pesan WhatsApp",
                    description:
                        "Pesan yang terisi otomatis di WhatsApp. Placeholder: {page} = judul halaman, {question} = pertanyaan terakhir pengunjung.",
                    type: "text",
                    rows: 2,
                },
            ],
        },
        {
            name: "availability",
            title: "Ketersediaan",
            description: "Mis. available for new projects from December 2026.",
            type: "text",
            rows: 2,
        },
    ],
    preview: {
        prepare() {
            return { title: "Chatbot Settings" };
        },
    },
});
