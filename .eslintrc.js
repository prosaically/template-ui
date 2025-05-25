module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ["plugin:vue/essential", "eslint:recommended", "plugin:prettier/recommended"],
    parserOptions: {
        parser: "@babel/eslint-parser"
    },
    rules: {
        "prettier/prettier": [
            "warn",
            {
                printWidth: 120,
                tabWidth: 4,
                useTabs: false,
                semi: true,
                singleQuote: false,
                quoteProps: "as-needed",
                jsxSingleQuote: false,
                trailingComma: "none",
                bracketSpacing: false,
                bracketSameLine: false,
                jsxBracketSameLine: false,
                arrowParens: "avoid",
                htmlWhitespaceSensitivity: "css",
                vueIndentScriptAndStyle: true
            }
        ],
        "vue/multi-word-component-names": "warn",
        "vue/no-child-content": "error",
        "vue/no-reserved-component-names": [
            "error",
            {
                disallowVueBuiltInComponents: true,
                disallowVue3BuiltInComponents: true
            }
        ],
        "vue/no-reserved-keys": [
            "error",
            {
                reserved: [],
                groups: []
            }
        ],
        "vue/no-reserved-props": [
            "error",
            {
                vueVersion: 2
            }
        ],
        "vue/no-unused-components": [
            "error",
            {
                ignoreWhenBindingPresent: true
            }
        ],
        "vue/no-unused-vars": [
            "error",
            {
                ignorePattern: "^_"
            }
        ],
        "vue/no-use-v-if-with-v-for": [
            "error",
            {
                allowUsingIterationVar: false
            }
        ],
        "vue/return-in-computed-property": [
            "error",
            {
                treatUndefinedAsUnspecified: true
            }
        ],
        "vue/use-v-on-exact": ["error"],
        "vue/valid-v-on": [
            "error",
            {
                modifiers: []
            }
        ],
        "vue/valid-v-slot": [
            "error",
            {
                allowModifiers: true
            }
        ],
        "vue/attribute-hyphenation": [
            "error",
            "always",
            {
                ignore: []
            }
        ],
        "vue/component-definition-name-casing": ["error", "PascalCase"],
        "vue/first-attribute-linebreak": [
            "error",
            {
                singleline: "ignore",
                multiline: "below"
            }
        ],
        "vue/html-closing-bracket-spacing": [
            "error",
            {
                startTag: "never",
                endTag: "never",
                selfClosingTag: "always"
            }
        ],
        "vue/html-quotes": ["error", "double", {avoidEscape: false}],
        "vue/html-self-closing": [
            "error",
            {
                html: {
                    void: "always",
                    normal: "never",
                    component: "always"
                },
                svg: "always",
                math: "always"
            }
        ],
        "vue/mustache-interpolation-spacing": ["error", "always"],
        "vue/no-multi-spaces": [
            "error",
            {
                ignoreProperties: false
            }
        ],
        "vue/no-spaces-around-equal-signs-in-attribute": ["error"],
        "vue/prop-name-casing": ["error", "camelCase"],
        "vue/v-bind-style": ["error", "shorthand"],
        "vue/v-on-style": ["error", "shorthand"],
        "vue/v-slot-style": [
            "error",
            {
                atComponent: "shorthand",
                default: "shorthand",
                named: "shorthand"
            }
        ],
        "vue/component-tags-order": [
            "error",
            {
                order: ["template", "script", "style"]
            }
        ],
        "vue/this-in-template": ["error", "never"],
        "vue/html-comment-content-spacing": ["error", "always", {exceptions: []}],
        "vue/html-comment-indent": ["error", 4],
        "vue/match-component-file-name": [
            "error",
            {
                extensions: ["vue"],
                shouldMatchCase: true
            }
        ],
        "vue/no-empty-component-block": "error",
        "vue/no-multiple-objects-in-class": "error",
        "vue/no-potential-component-option-typo": [
            "error",
            {
                presets: ["all"],
                custom: [],
                threshold: 1
            }
        ],
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off"
    }
};
