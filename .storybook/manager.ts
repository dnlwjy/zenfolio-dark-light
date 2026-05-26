import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// Override Storybook's default favicon
const setFavicon = () => {
  document.querySelectorAll('link[rel*="icon"]').forEach((el) => el.remove());
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  link.href = "/favicon.png";
  document.head.appendChild(link);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setFavicon);
} else {
  setFavicon();
}

addons.setConfig({
  theme: create({
    base: "dark",
    brandTitle: "My Portfolio",
    brandImage: "/favicon.png",
    brandTarget: "_self",
  }),
});
