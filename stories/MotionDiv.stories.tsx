import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/react";
import MotionDiv from "../components/MotionDiv";

const meta: Meta<typeof MotionDiv> = {
  title: "Components/MotionDiv",
  component: MotionDiv,
  argTypes: {
    variant: {
      control: "select",
      options: ["up", "down", "left", "right"],
    },
    del: {
      control: "select",
      options: [0.3, 0.5, 0.7],
    },
    styles: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MotionDiv>;

const SampleContent = () => (
  <div className="p-6 bg-(--divider) rounded">
    <h3>Animated Content</h3>
    <p className="text-(--gray) mt-2">This block animates into view.</p>
  </div>
);

export const Left: Story = {
  args: {
    variant: "left",
    del: 0.3,
    children: <SampleContent />,
  },
};

export const Up: Story = {
  args: {
    variant: "up",
    children: <SampleContent />,
  },
};

export const Down: Story = {
  args: {
    variant: "down",
    children: <SampleContent />,
  },
};

export const Right: Story = {
  args: {
    variant: "right",
    children: <SampleContent />,
  },
};

export const AllVariants = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 p-8">
      {(["up", "down", "left", "right"] as const).map((variant) => (
        <MotionDiv key={variant} variant={variant}>
          <div className="p-6 bg-(--divider) rounded">
            <p className="tag text-(--gray) mb-1">variant: {variant}</p>
            <h3>Animated ({variant})</h3>
          </div>
        </MotionDiv>
      ))}
    </div>
  ),
};
