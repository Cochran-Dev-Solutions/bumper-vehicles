export default [
  {
    ignores: ["dist/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "off",
      quotes: ["error", "double"],
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    files: [
      "apps/game-backend/**",
      "apps/landing-page-backend/**",
      "packages/database/**",
      "packages/mailer/**",
      "packages/redis/**",
    ],
    env: {
      node: true,
      es2022: true,
    },
  },
  {
    ignores: ["dist/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "off",
      quotes: ["error", "double"],
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    files: ["apps/game-frontend/**", "apps/landing-page-frontend/**"],
  },
];
