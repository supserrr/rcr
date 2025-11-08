import { nextJsConfig } from "@workspace/eslint-config/next-js"

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    ignores: [".next/**"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "no-useless-escape": "off",
      "no-useless-catch": "off",
      "turbo/no-undeclared-env-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "off",
      "@next/next/no-assign-module-variable": "off",
      "prefer-const": "off",
    }
  }
]
