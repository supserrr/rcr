import { nextJsConfig } from "@workspace/eslint-config/next-js"

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    rules: {
      // Allow unused variables that start with underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      // Allow explicit any with escape hatch
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unescaped entities in JSX
      "react/no-unescaped-entities": "warn",
      // Allow img tags (we use them intentionally for certain cases)
      "@next/next/no-img-element": "warn",
      // Allow unnecessary escape characters
      "no-useless-escape": "warn",
      // Allow unnecessary catch clause
      "no-useless-catch": "warn",
    }
  }
]
