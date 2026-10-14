<div align="center">

![OG Preview](./public/og-default.jpg)

<div align="left">

##
The website is fully **static** enabling the best load time and a strong SEO. The important data are delivered via Sanity, not hard-coded, in which they all are prepared during build time resulting in zero CMS requests at runtime. Here are some the key features:

- **Keyboard Navigation**: use hotkeys ( Q / W / E / R ) to navigate between pages
- **Moon / Sun transition**: transition between icons using [Flubber](https://github.com/veltman/flubber) (SVG morphing)
- **TypeScript + Zod**: build-time type checking and runtime validation
- **Sanity CMS**: GROQ query during build time (zero-runtime CMS overhead)
- **Sanity TypeGen**: Enable TypeScript sync between Sanity schema and frontend
- **Responsiveness**: spacings & typography looks great on big screens (2K or above)
- **Framer Motion**: smooth animations using optimized version { m }
- **Storybook**: Design system and documentation
- **Google Analytics 4**: tracks anonymous visitors to gather insights
- **Chatbot assistant**: page-aware assistant that answers only from this portfolio's content, streams replies and offers a WhatsApp hand-off when a visitor wants to reach out
- **Insight-ready analytics**: chat sessions, interaction events, cost per message, and a daily budget circuit breaker (stored in Postgres/Supabase with a rollup view)

##

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-000000?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-000000?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-000000?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-000000?style=flat-square&logo=framer&logoColor=white)
![Sanity](https://img.shields.io/badge/Sanity-000000?style=flat-square&logo=sanity&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-000000?style=flat-square&logo=storybook&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-000000?style=flat-square&logo=zod&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-000000?style=flat-square&logo=resend&logoColor=white)

## Disclaimer
This project includes Google Analytics 4 integration for educational and learning purposes only. It does not collect sensitive information such as names, email addresses, phone numbers, etc. If you fork this project, you are responsible for reviewing and complying with any applicable privacy, cookie, or data protection requirements in your jurisdiction.

## License
This project is licensed under the [MIT License](./LICENSE) — it grants anyone the freedom to view, learn from, and build upon the code, as long as the original copyright notice is retained. That said, please respect the spirit of open source.

## Get Started

Copy `.env.example` to `.env` and fill the required values first — see [Environment variables](#environment-variables) —
then:
```bash
npm install && npm run dev
```

<br />

To run or deploy Sanity:
```bash
cd sanity && npm run dev
```

```bash
cd sanity && npx sanity deploy
```

<br />

To run Sanity TypeGen:
```bash
npx sanity schema extract
npx sanity typegen generate
```
(this keeps `schema.json` and `sanity.types.ts` in sync with the updated schema)

<br />

To run Storybook:

```bash
npm run storybook
```

## Chatbot assistant

The assistant answers **only** from this portfolio's content (Sanity is the source of truth) and never invents facts:

- per-page greeting (once per route per session) and suggested questions, editable in Sanity,
- grounded answers that cite the page they came from, streamed into the widget with a Stop control,
- two always-visible contact paths: a **WhatsApp CTA** with a prefilled message and a link to the contact page,
- abuse and cost guards: reCAPTCHA v3 per message, layered rate limits, input/output caps,
- a daily budget circuit breaker — when it trips, visitors see a calm message plus the WhatsApp hand-off,
- chat sessions, events and cost per message stored in Postgres (Supabase) with an `insight_daily` rollup view.

Key files: `app/api/chat/route.ts` (SSE endpoint) · `lib/chat/*` (prompt, boundary, limits, persistence) ·
`lib/ai/*` (provider registry, pricing, error taxonomy) · `components/Chatbot.tsx` and `components/chat/useChatStream.ts` (widget) ·
`scripts/build-knowledge.mts` (build-time knowledge bundle) · `db/*` (schema and migrations) · `eval/chat-eval-set.json` (30-case eval set).

<br />

### Knowledge bundle

`npm run dev` and `npm run build` regenerate `lib/knowledge/knowledge.generated.json` from Sanity
(`npm run knowledge:build:force` forces a refresh). The chatbot therefore sees exactly what visitors see, with no runtime CMS requests.

### Chatbot content (Sanity)

```bash
cd sanity && npm run deploy      # deploy the studio, including the `chatbot` document schema
```

Create the **Chatbot** document (a singleton) in the studio and import `sanity/seed/chatbot.json` as a starting point.
It controls greetings per route, suggested questions, FAQs, availability and the WhatsApp escalation copy.
Until it is deployed, the English defaults in `lib/chat/content.ts` are used.

Point a Sanity webhook at a Vercel Deploy Hook so publishing content triggers a rebuild (< 5 minutes) and the chatbot picks up the change.

<br />

## Environment variables

Copy `.env.example` to `.env` locally, or fill the same names in the Vercel project settings for production.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | yes | Sanity content source |
| `OPENCODE_API_KEY` | yes | LLM provider key (OpenCode Zen, pay-as-you-go) |
| `LLM_PROVIDER`, `LLM_MODEL`, `LLM_FALLBACK_MODEL` | recommended | Which model answers (defaults: `opencode`, `glm-5.3-flash`, `deepseek-v4.1-flash`) |
| `DATABASE_URL`, `DATABASE_URL_MIGRATE` | yes | Postgres (Supabase): runtime uses the transaction pooler (port 6543), migrations use session mode (5432) |
| `NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY`, `RECAPTCHA_V3_SECRET_KEY` | yes | reCAPTCHA v3 for chat — a separate key pair from the contact form's v2 key |
| `WHATSAPP_NUMBER` | yes | WhatsApp CTA target (international format, digits only) |
| `CRON_SECRET` | production | Protects `/api/cron/keepalive`; Vercel sends it automatically on cron calls |
| `CHAT_*`, `RATE_LIMIT_STORE` | optional | Every limit, budget and abuse knob (defaults live in `lib/config/chat.ts`) |

## LLM provider

Providers are configuration, not code: `lib/ai/providers.ts` holds the registry and `lib/ai/pricing.ts`
the price table used for cost logging. Swapping models is an environment change:

```bash
LLM_PROVIDER=opencode
LLM_MODEL=glm-5.3-flash              # model id on the provider
LLM_FALLBACK_MODEL=deepseek-v4.1-flash
```

Each registry entry records quirks verified in live testing (for example `glm-5.3-flash` emits no
reasoning tokens, while `deepseek-v4.1-flash` always reasons), so reasoning tokens are never forwarded
to visitors and the request body stays valid per provider. Re-run the eval set after switching models.

## Database (Supabase)

```bash
npx drizzle-kit generate                                      # after editing db/schema.ts
DATABASE_URL_MIGRATE="<session-pooler-url>" npx drizzle-kit migrate
```

Migrations live in `db/migrations/*.sql` and are committed for review; each file ends with a `-- ROLLBACK` block.
Row Level Security is enabled on every chat table **without policies** (deny-all) because the app talks to
Postgres directly and never uses the Data API. Full runbook: `db/README.md`.

## Deploy to Vercel

1. Import the repository and set every variable from the table above (Production and Preview).
2. Keep the build command as `npm run build` — it regenerates the knowledge bundle from Sanity before `next build`.
3. Run the database migration against the production database before the first request.
4. `vercel.json` registers a daily cron for `/api/cron/keepalive` (keeps a free-tier Supabase project from pausing).
5. Deploy the Sanity studio, create the chatbot document, and connect the content webhook to a deploy hook.
6. Smoke test: ask one question in the widget, then look for `chat.turn_complete` in the logs
   (provider, model, tokens, `costUsd`, `recaptchaScore`) and watch for `chat.budget_exceeded`.

## Testing

```bash
npm run test:unit     # unit tests: prompt, boundary, rate limits, reCAPTCHA, reducer, cron guard, retry
npm run eval:chat     # 30-case eval set against the real prompt pipeline (~2 min, ~$0.02)
```

</div>