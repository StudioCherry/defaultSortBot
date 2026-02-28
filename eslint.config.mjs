import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("eslint:recommended"),

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.mocha,
            ...globals.browser,
        },

        ecmaVersion: 8,
        sourceType: "module",
    },

    rules: {
        indent: ["error", 2],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "single", "avoid-escape"],
        semi: ["error", "always"],

        camelcase: ["error", {
            properties: "always",
        }],

        "key-spacing": ["error", {
            singleLine: {
                beforeColon: true,
                afterColon: true,
            },

            multiLine: {
                beforeColon: true,
                afterColon: true,
                align: "colon",
            },
        }],

        eqeqeq: "error",
        "block-scoped-var": "error",

        complexity: ["error", {
            maximum: 6,
        }],

        curly: "error",
        "default-case": "error",
        "dot-location": ["error", "property"],
        "guard-for-in": "error",
        "no-eval": "error",
        "block-spacing": "error",

        "comma-spacing": ["error", {
            before: false,
            after: true,
        }],

        "id-length": ["error", {
            min: 2,
            properties: "never",
            exceptions: [],
        }],

        "space-before-function-paren": ["error", "never"],
        "space-before-blocks": "error",
        "prefer-const": "error",
        "no-var": "error",
        "arrow-spacing": "error",

        "no-warning-comments": ["warn", {
            terms: ["todo", "fixme", "hack"],
            location: "anywhere",
        }],

        "no-console": "off",
    },
}]);