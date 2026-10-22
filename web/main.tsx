import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { DocsPage } from "./pages/docs";
import { HomePage } from "./pages/home";
import { JlmuaPage } from "./pages/jlmua";
import "./tokens.css";
import "./style.css";

/** 每个 HTML 入口在 body 上声明自己是谁，构建时互不牵连。 */
const ROUTES = {
  home: HomePage,
  docs: DocsPage,
  jlmua: JlmuaPage,
} as const;

const page = document.body.dataset.page;
const Page = page && page in ROUTES ? ROUTES[page as keyof typeof ROUTES] : undefined;

const container = document.getElementById("root");
if (!container) throw new Error("missing #root");
if (!Page) throw new Error(`unknown page: ${page}`);

createRoot(container).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
