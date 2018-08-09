module.exports = {
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 8
  },
  extends: "eslint:recommended",
  rules: {
    "no-cond-assign": "off",
    "quotes": ["warn", "single", {avoidEscape: true}],
    "no-console": ["warn"],
    "indent": ["warn", 2],
    "comma-dangle": ["warn", "always-multiline"],
  },
};
