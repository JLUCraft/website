import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
// VitePress compiles Vue SFCs; tsc has no SFC shim in this workspace.
// @ts-expect-error -- Vue single-file component
import NewsList from "./components/NewsList.vue";

// 令牌是生成物（brand-palette），brand.css 只做 VitePress 变量到令牌的映射。
import "./tokens.css";
import "./brand.css";

const theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("NewsList", NewsList);
  },
} satisfies Theme;

export default theme;
