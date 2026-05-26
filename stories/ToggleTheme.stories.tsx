import "../app/globals.css";
import type { Meta, StoryObj } from "@storybook/react";
import ToggleTheme from "../components/ToggleTheme";

const meta: Meta<typeof ToggleTheme> = {
  title: "Components/ToggleTheme",
  component: ToggleTheme,
  argTypes: {
    styles: { control: "text" },
    size: {
      control: { type: "range", min: 24, max: 320, step: 4 },
      description: "Size of the toggle in pixels",
    },
    strokeWidth: {
      control: { type: "range", min: 0.25, max: 4, step: 0.25 },
      description: "Stroke width of the SVG paths",
    },
    filled: {
      control: "boolean",
      description: "Fill the icon shape",
    },
  },
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof ToggleTheme>;

const Playground = ({
  size,
  strokeWidth,
  filled,
}: {
  size?: number;
  strokeWidth?: number;
  filled?: boolean;
}) => {

  return (
    <div className="relative h-full w-full flex flex-col md:block items-center justify-center gap-8 px-4 py-10 md:py-0">

        <p className="text-center mb-4">Click below</p>

        {/* PREVIEW */}
        <div className="relative flex items-center justify-center p-16 border border-(--divider) bg-(--white)/7">
          <div className="flex items-center justify-center aspect-square w-full md:w-90">
            <ToggleTheme size={size} strokeWidth={strokeWidth} filled={filled} />
          </div>
        </div>
    </div>
  );
};

export const PlaygroundStory: Story = {
  name: "Playground",
  args: {
    size: 300,
    strokeWidth: 0.75,
    filled: false,
  },
  render: (args) => <Playground size={args.size} strokeWidth={args.strokeWidth} filled={args.filled} />,
};