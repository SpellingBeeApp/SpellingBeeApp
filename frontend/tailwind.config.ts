import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(49, 100%, 54%)",
        "primary-content": "hsl(49, 100%, 10%)",
        secondary: "hsl(210, 100%, 60%)",
        "secondary-content": "hsl(0, 0%, 98%)",
        accent: "hsl(152, 70%, 50%)",
        "accent-content": "hsl(152, 70%, 10%)",
      },
    },
  },
  plugins: [require("daisyui"), require("tailwindcss-animated")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "hsl(49, 100%, 54%)",
          "primary-content": "hsl(49, 100%, 10%)",
          secondary: "hsl(210, 100%, 60%)",
          "secondary-content": "hsl(0, 0%, 98%)",
          accent: "hsl(152, 70%, 50%)",
          "accent-content": "hsl(152, 70%, 10%)",
        },
      },
    ],
  },
};

export default config;
