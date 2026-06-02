import type { ElementType } from "react";
import "../app/globals.css";

export default { title: "Foundation/Headings" };

const headings: { tag: ElementType; base: string; sm: string; lg: string; text: string }[] = [
  { tag: "h1", base: "48px", sm: "72px", lg: "96px", text: "Heading 1" },
  { tag: "h2", base: "28px", sm: "32px", lg: "40px", text: "Heading 2" },
  { tag: "h3", base: "24px", sm: "24px", lg: "28px", text: "Heading 3" },
];

export const AllHeadings = {
  name: "All Headings",
  render: () => (
    <section className="flex flex-col gap-20 w-full items-center max-w-200 ">
      {headings.map(({ tag: Tag, base, sm, lg, text }) => (
        <div key={text} className="flex flex-col gap-3 border-b border-(--divider) pb-10 w-full items-center">
          <div className="flex gap-8 justify-center">
            <span className="tag text-(--gray) lg:text-(--white)">{lg}</span>
            <span className="tag text-(--gray) sm:text-(--white) lg:text-(--gray)">{sm}</span>
            <span className="tag text-(--white) sm:text-(--gray)">{base}</span>
          </div>
          <Tag>{text}</Tag>
        </div>
      ))}
    </section>
  ),
};
