<div align="center">

<svg width="72" height="72" viewBox="0 0 52 52" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M18.1984 39.0406H1.13537V19.7393C4.08733 25.3513 7.07174 30.9632 10.0561 36.5428H3.63319V28.6276C3.37367 28.1086 3.08172 27.622 2.82221 27.103C2.82221 30.5091 2.82221 33.9476 2.82221 37.3538H17.0954L22.0262 28.0762L21.572 27.2003L16.6088 36.5428H13.9164L0.908296 12.1161H0L12.9757 36.5428H10.9644L0.324392 16.4954V39.884H18.685L23.486 30.8659C23.3238 30.574 23.194 30.282 23.0318 29.9901L18.1984 39.0406Z" />
  <path d="M46.1934 12.1161L33.8665 35.2776C32.7636 33.1042 27.184 22.3344 25.3999 19.3825C25.2701 19.1878 25.0431 18.7661 24.6538 18.2795C23.2265 16.3656 21.5721 15.2627 20.8584 14.841C20.1123 14.4193 18.8147 13.738 17.063 13.3488C15.8952 13.0893 14.8896 13.0244 14.1435 13.0244H4.31444C7.94763 19.869 11.5808 26.6813 15.214 33.5259C16.836 30.5091 18.4255 27.4598 20.0474 24.443L20.5016 25.3188C18.7499 28.5952 16.9657 31.904 15.214 35.2128L2.95199 12.181H14.1435C15.3762 12.181 18.2633 12.3432 21.2801 14.1598C24.297 15.9763 25.8216 18.4093 26.4055 19.5122C28.8709 24.1835 31.3687 28.8547 33.8341 33.5259L45.2202 12.1161H46.1934Z" />
  <path d="M49.1453 12.1161L35.7155 37.3538H32.1147L24.232 22.6264L22.7074 19.9339C21.7342 18.5715 20.4366 17.4685 18.9444 16.7224C17.4847 15.9763 15.8303 15.5546 14.1434 15.5546H7.85024L7.42854 14.7112H14.1434C15.1491 14.7112 17.1278 14.841 19.3013 15.9763C21.5071 17.1117 22.7723 18.6688 23.3562 19.4798L24.9132 22.2047L32.5689 36.5428H35.1965L48.2046 12.1161H49.1453Z" />
  <path d="M52 12.1161L37.2402 39.8516H30.428L29.9738 39.0082C27.0543 33.5259 24.1348 28.0437 21.2152 22.5291C21.1828 22.4642 21.1504 22.3993 21.1179 22.3344V22.302C19.7879 19.7717 17.0955 18.1173 14.1435 18.1173H9.24519L8.79104 17.3064H14.1435C17.4847 17.3064 20.534 19.2203 21.9613 22.1722L30.9146 39.0406H36.7536L51.0593 12.1161H52Z" />
</svg>

<h1 align="center">Portfolio Website (Zenfolio)</h1>

![OG Preview](./public/og-default.jpg)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-000000?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-000000?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-000000?style=for-the-badge&logo=framer&logoColor=white)
![Sanity](https://img.shields.io/badge/Sanity-000000?style=for-the-badge&logo=sanity&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-000000?style=for-the-badge&logo=storybook&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-000000?style=for-the-badge&logo=vitest&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-000000?style=for-the-badge&logo=zod&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white)

<br />

<div align="left">

## About
The website is fully **static** enabling the best load time and a strong SEO. The important data are delivered via Sanity (not hard-coded) in which they all are prepared during build time resulting no additional requests when visiting the website.

Here are some the key features:

- **Keyboard Navigation** — use hotkeys ( Q / W / E / R ) to navigate between pages
- **Moon / Sun transition** — transition between icons using [Flubber](https://github.com/veltman/flubber) (SVG morphing)
- **Sanity CMS** — GROQ query during build time (zero-runtime CMS overhead)
- **Sanity TypeGen** — Enable TypeScript sync between Sanity schema and frontend
- **Optimized for big screens** — spacings & typography looks great on larger screens (2K 4K monitors)
- **Loading screen** — preloads critical videos before first render
- **Framer Motion** — uses lightweight bundle `{ m }` with `LazyMotion`
- **Storybook** — Design system and documentation

<br />

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

<br />

## License

This project is licensed under the [MIT License](./LICENSE) — it grants anyone the freedom to view, learn from, and build upon the code, as long as the original copyright notice is retained. That said, please respect the spirit of open source:



- For personal use and learning — welcome 👍
- Sharing with attribution — appreciated 🙏
- Redistributing, reselling, or publishing as your own — strictly prohibited 😡

<br />

</div>