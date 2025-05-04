import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig(
  tseslint.config(eslint.configs.recommended, tseslint.configs.recommended),
  [
    globalIgnores([
      ".next/*",
      "next.config.js",
      "postcss.config.js",
      "tailwind.config.ts",
      "next-env.d.ts",
    ]),
    reactHooks.configs["recommended-latest"],
    react.configs.flat.recommended,
    react.configs.flat["jsx-runtime"],
    {
      plugins: {
        react,
      },
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
        globals: {
          ...globals.browser,
        },
      },
      settings: {
        react: {
          version: "detect",
        },
      },
    },
  ]
);
