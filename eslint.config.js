// @ts-check
import { tanstackConfig } from "@tanstack/eslint-config"
import { importX } from "eslint-plugin-import-x"

export default [
  ...tanstackConfig,
  {
    plugins: {
      "import-x": importX,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "import-x/no-dynamic-require": "warn",
      "import-x/no-nodejs-modules": "warn",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "off",
    },
  },
]
