import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import NewsList from "./components/NewsList";

// 静态品牌令牌，原生成器已移除；brand.css 只做 VitePress 变量到令牌的映射。
import "./tokens.css";
import "./brand.css";

const theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("NewsList", NewsList);
  },
} satisfies Theme;

export default theme;
