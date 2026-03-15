import { createRequire } from "module";

const require = createRequire(import.meta.url);

// eslint-config-next ships a native flat config array — import it directly
// to avoid @eslint/eslintrc's FlatCompat circular-reference bug.
const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
