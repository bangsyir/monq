//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: false,
  trailingComma: "all",
  // plugins: ["@trivago/prettier-plugin-sort-imports"],
  // importOrder: [
  //   "^react(.*)$", // React imports first
  //   "<BUILTIN_MODULES>", // Node.js built-in modules
  //   "<THIRD_PARTY_MODULES>", // All other third-party libraries (e.g., @tanstack/*)
  //   "^~/(.*)$", // Your project aliases (if you use them, e.g., for src/)
  //   "^[./]", // Relative imports (./, ../)
  // ],
  // importOrderSortSpecifiers: true, // Sort imports within the same group alphabetically
}

export default config
