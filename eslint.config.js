import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "android/**",
      "coverage/**",
      "node_modules/**",
      "public/**",
      "*.min.js",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react-hooks/purity": "off",
    },
  },
  {
    files: [
      "src/components/NutritionScreen.tsx",
      "src/components/RatShop.tsx",
      "src/components/ShopScreen.tsx",
    ],
    rules: {
      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    files: ["src/revenuecat.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);