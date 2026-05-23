import "../app/globals.css";
import type { Meta } from "@storybook/react";
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

export const AllVariants = {
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