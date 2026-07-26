import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The codebase's convention for an intentionally-unused Server Action
      // parameter (e.g. `_prevState` in useActionState-bound actions) is a
      // leading underscore. The default "after-used" policy only ignores
      // unused args that precede a used one, so a function where every arg
      // after the first is unused (e.g. an action with no form fields)
      // still warned despite following the convention. Enforce the
      // convention instead of relying on argument order.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
