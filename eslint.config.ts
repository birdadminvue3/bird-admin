// ESLint 10 flat config（依赖已声明在 package.json，配置文件为 .ts，由 jiti 加载）
import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import * as parserVue from "vue-eslint-parser";
import * as parserTypeScript from "@typescript-eslint/parser";
import pluginTypeScript from "@typescript-eslint/eslint-plugin";

const browserGlobals = {
  console: "readonly",
  window: "readonly",
  document: "readonly",
  navigator: "readonly",
  localStorage: "readonly",
  sessionStorage: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  URL: "readonly",
  Blob: "readonly",
  File: "readonly",
  FormData: "readonly",
  AbortController: "readonly",
  fetch: "readonly",
  KeyboardEvent: "readonly",
  __APP_INFO__: "readonly",
};

const unusedVarsRule = [
  "error",
  { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
] as const;

export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/*.d.ts",
      "public/**",
      "src/assets/**",
      ".auto-import.json",
    ],
  },
  {
    ...js.configs.recommended,
    languageOptions: { globals: browserGlobals },
    rules: {
      ...js.configs.recommended.rules,
      // TS 类型、Vue 编译宏与自动导入由编译器处理，避免误报
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: parserTypeScript,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
      globals: browserGlobals,
    },
    plugins: { "@typescript-eslint": pluginTypeScript },
    rules: { "@typescript-eslint/no-unused-vars": unusedVarsRule },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: parserTypeScript,
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
      globals: browserGlobals,
    },
    plugins: { "@typescript-eslint": pluginTypeScript },
    rules: { "@typescript-eslint/no-unused-vars": unusedVarsRule },
  },
  ...pluginVue.configs["flat/essential"],
  {
    // 本项目约定用 index.vue 作为目录入口，关闭该命名规则
    files: ["**/*.vue"],
    rules: { "vue/multi-word-component-names": "off" },
  },
];
