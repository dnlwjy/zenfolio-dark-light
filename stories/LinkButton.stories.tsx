import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/react";
import LinkButton from "../components/LinkButton";

const meta: Meta<typeof LinkButton> = {
  title: "Components/LinkButton",
  component: LinkButton,
  argTypes: {
    title: { control: "text" },
    link: { control: "text" },
  },
};

export default meta;

export const Default = {
  render: (args: any) => (
    <div className="flex flex-col gap-8 items-center">
      <LinkButton {...args} />
    </div>
  ),
  args: {
    title: "Visit Website",
    link: "https://danielwijaya.com",
  },
};

type GroupArgs = { title1: string; link1: string; title2: string; link2: string };

export const Group: StoryObj<GroupArgs> = {
  args: {
    title1: "Visit Website",
    link1: "https://danielwijaya.com",
    title2: "View CV",
    link2: "https://drive.google.com/file/d/1g2-1tF6l2J3GOTJN6D0DE1R_SZnUv4wU/view",
  },
  argTypes: {
    title1: { control: "text", name: "Title", table: { category: "Item 1" } },
    link1: { control: "text", name: "Link", table: { category: "Item 1" } },
    title2: { control: "text", name: "Title", table: { category: "Item 2" } },
    link2: { control: "text", name: "Link", table: { category: "Item 2" } },
  },
  render: (args) => (
    <div className="flex gap-6 items-center">
      <LinkButton title={args.title1} link={args.link1} />
      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.25" fill="currentColor" viewBox="-1 -1 7 12"><path stroke="var(--gray)" strokeWidth=".5" d="M.826 9.949H0L3.318.05h.826z" /></svg>
      <LinkButton title={args.title2} link={args.link2} />
    </div>
  ),
}