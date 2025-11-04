module.exports = {
  root: true,
  extends: "universe/native",
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        trailingComma: "all",
      },
    ],
    "@typescript-eslint/no-use-before-define": 0,
    "eslint/no-use-before-define": 0,
    "import/no-extraneous-dependencies": 0, // related module hoisting
    "import/extensions": 0,
    "import/order": "off",
    "import/prefer-default-export": "off",
    "no-console": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [0, { args: "none" }],
    "object-curly-spacing": ["error", "always"],
    "react/prop-types": "off",
    "react/require-default-props": "off", // Since we do not use prop-types
    "react/no-array-index-key": 0,
    "react/jsx-uses-react": "off",
    "react/jsx-fragments": 0,
    "react/react-in-jsx-scope": "off",
    "react/jsx-props-no-spreading": "off",
    "react/button-has-type": 0,
    "react-hooks/exhaustive-deps": "error",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "enumMember",
        format: ["UPPER_CASE"],
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
    ],
    semi: ["error", "always"],
  },
  plugins: ["@typescript-eslint/eslint-plugin"],
};
