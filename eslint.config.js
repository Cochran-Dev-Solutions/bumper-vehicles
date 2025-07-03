export default [
  {
    ignores: ["dist/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Node.js globals
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
        // ECMAScript 2022 globals (if needed, add more)
      },
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
  },
  {
    ignores: ["dist/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        // ECMAScript 2022 globals (if needed, add more)
      },
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
