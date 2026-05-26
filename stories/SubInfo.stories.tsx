import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/react";
import SubInfo from "../components/SubInfo";

const meta: Meta<typeof SubInfo> = {
  title: "Components/SubInfo",
  component: SubInfo,
  argTypes: {
    title: { table: { disable: true } },
    subtitle: { table: { disable: true } },
    styles: { table: { disable: true } },
  },
};

export default meta;

type AllVariantsArgs = {
  title1: string; subtitle1: string;
  title2: string; subtitle2: string;
  title3: string; subtitle3: string;
};

export const AllVariants: StoryObj<AllVariantsArgs> = {
  args: {
    title1: "Full Name", subtitle1: "Daniel Wijaya",
    title2: "Personal Website", subtitle2: "https://www.danielwijaya.com/",
    title3: "TikTok", subtitle3: "",
  } as AllVariantsArgs,
  argTypes: {
    title1: { control: "text", name: "Title", table: { category: "Item 1" } },
    subtitle1: { control: "text", name: "Subtitle", table: { category: "Item 1" } },
    title2: { control: "text", name: "Title", table: { category: "Item 2" } },
    subtitle2: { control: "text", name: "Subtitle", table: { category: "Item 2" } },
    title3: { control: "text", name: "Title", table: { category: "Item 3" } },
    subtitle3: { control: "text", name: "Subtitle", table: { category: "Item 3" } },
  },
  render: (args) => (
    <div className="flex flex-col gap-8 p-8 w-full max-w-125">
      <SubInfo title={args.title1} subtitle={args.subtitle1} />
      <SubInfo title={args.title2} subtitle={args.subtitle2} />
      <SubInfo title={args.title3} subtitle={args.subtitle3} />
    </div>
  ),
};