import { fixupPluginRules } from "@eslint/compat";
import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import prettier from "eslint-config-prettier";
import jsoncPlugin from "eslint-plugin-jsonc";
import perfectionist from "eslint-plugin-perfectionist";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

function convertErrorToWarn(rules) {
  return Object.keys(rules).reduce((acc, key) => {
    const [_type, options] = rules[key];
    acc[key] = ["warn", options];
    return acc;
  }, {});
}

export default tseslint.config(
  //
  // Base configuration
  //
  {
    ignores: ["node_modules"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/padding-line-between-statements": [
        "warn",
        {
          blankLine: "always",
          next: ["enum", "interface", "function"],
          prev: "*",
        },
      ],
    },
  },
  {
    plugins: {
      perfectionist,
    },
    rules: {
      // Don't error on sorting rules, just warn instead.
      ...convertErrorToWarn(perfectionist.configs["recommended-natural"].rules),
      "perfectionist/sort-imports": [
        "warn",
        {
          internalPattern: ["^@/.*", "^~/.*"],
        },
      ],
      "perfectionist/sort-jsx-props": [
        "warn",
        {
          customGroups: {
            callback: "^on.+",
            className: "^className",
            refs: "^ref",
            render: "^render",
          },
          groups: [
            "refs",
            "className",
            "unknown",
            "shorthand",
            "callback",
            "multiline",
            "render",
          ],
        },
      ],
      "perfectionist/sort-union-types": [
        "warn",
        {
          groups: [
            "conditional",
            "function",
            "import",
            "intersection",
            "keyword",
            "literal",
            "named",
            "object",
            "operator",
            "tuple",
            "union",
            "nullish",
          ],
        },
      ],
    },
  },
  {
    plugins: {
      "unused-imports": fixupPluginRules(unusedImportsPlugin),
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "unused-imports/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          vars: "all",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "no-console": "warn",
      "no-empty-pattern": "off",
    },
  },
  prettier,
  ...jsoncPlugin.configs["flat/recommended-with-json"],
  {
    files: ["package.json"],
    rules: {
      "jsonc/sort-keys": [
        "warn",
        {
          order: [
            "name",
            "version",
            "private",
            "scripts",
            "dependencies",
            "devDependencies",
          ],
          pathPattern: "^$",
        },
      ],
    },
  },
);
