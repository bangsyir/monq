//  @ts-check
import { defineConfig, globalIgnores } from "eslint/config"
import { tanstackConfig } from "@tanstack/eslint-config"

export default defineConfig([
  ...tanstackConfig,
  {
    rules: {
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },
  globalIgnores([
    "**/*.js",
    "**/*.cjs",
    "**/*.mjs",
    "!prettier.config.js",
    "!eslint.config.js",
    "node_modules/",
    ".tanstack/",
  ]),
])

// export default [
//   ...tanstackConfig,
//   {
//     rules: {
//       "no-shadow": "off",
//       "@typescript-eslint/no-shadow": "off",
//       "@typescript-eslint/no-unnecessary-condition": "off",
//     },
//   },
// ]
