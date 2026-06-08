<div align="center">

![OG Preview](./public/og-default.jpg)

<div align="left">

##
The website is fully **static** enabling the best load time and a strong SEO. The important data are delivered via Sanity, not hard-coded, in which they all are prepared during build time resulting in zero CMS requests at runtime. Here are some the key features:

- **Keyboard Navigation** — use hotkeys ( Q / W / E / R ) to navigate between pages
- **Moon / Sun transition** — transition between icons using [Flubber](https://github.com/veltman/flubber) (SVG morphing)
- **TypeScript + Zod** — build-time type checking and runtime validation
- **Sanity CMS** — GROQ query during build time (zero-runtime CMS overhead)
- **Sanity TypeGen** — Enable TypeScript sync between Sanity schema and frontend
- **Optimized for big screens** — spacings & typography looks great on larger screens (2K 4K monitors)
- **Loading screen** — preloads critical videos before first render
- **Framer Motion** — smooth page transitions and animations with optimized bundle loading
- **Storybook** — Design system and documentation
- **Google Analytics 4** — tracks anonymous visitors to gather insights

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
To start:
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

</div>