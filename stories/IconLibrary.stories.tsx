import "../app/globals.css";
import type { Meta } from "@storybook/react";
import {
  Home,
  Builds,
  About,
  Contact,
  Preview,
  IG,
  LI,
  Github,
  Spotify,
  Search,
  Close,
} from "../components/IconLibrary";

const meta: Meta = {
  title: "Foundation/IconLibrary",
};

export default meta;

const icons = [
  Home,
  Builds,
  About,
  Contact,
  Preview,
  IG,
  LI,
  Github,
  Spotify,
  Search,
  Close,
];

export const AllIcons = {
  render: () => (
    <div className="flex flex-wrap gap-8 p-6">
      {icons.map((Icon, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <Icon size={32} />
        </div>
      ))}
    </div>
  ),
};