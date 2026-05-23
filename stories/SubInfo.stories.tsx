import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/react";
import SubInfo from "../components/SubInfo";

const meta: Meta<typeof SubInfo> = {
  title: "Components/SubInfo",
  component: SubInfo,
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
    styles: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SubInfo>;

export const AllVariants: Story = {
  args: {
    title: "Website",
    subtitle: "https://www.danielwijaya.com/",
  },
  argTypes: {
    styles: { control: false },
  },
  render: (args) => (
    <div className="flex flex-col gap-8 p-8 w-full max-w-125">
      <SubInfo {...args} />
    </div>
  ),
};