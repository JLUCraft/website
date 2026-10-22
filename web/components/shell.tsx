import type { ReactNode } from "react";

import { t } from "../i18n";
import { PAGES, SITE, type PageKey } from "../site";

const NAV: { key: PageKey; label: "首页" | "使用文档" | "JLMUA" }[] = [
  { key: "home", label: "首页" },
  { key: "docs", label: "使用文档" },
  { key: "jlmua", label: "JLMUA" },
];

/** 站外链接统一出口：新窗口打开、加 rel，并给屏幕阅读器补一句提示。 */
export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
    >
      {children}
      <span aria-hidden="true"> ↗</span>
      <span className="visually-hidden">{t("在新窗口打开")}</span>
    </a>
  );
}

export function Header({ page }: { page: PageKey }) {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        {t("跳到主要内容")}
      </a>
      <div className="site-header-bar">
        <a className="brand" href={PAGES.home}>
          <span className="brand-mark" aria-hidden="true">
            JL
          </span>
          <span className="brand-name">{t("JLUCraft")}</span>
        </a>
        <nav aria-label={t("主导航")}>
          <ul className="nav">
            {NAV.map((item) => (
              <li key={item.key}>
                <a
                  href={PAGES[item.key]}
                  className="nav-link"
                  aria-current={item.key === page ? "page" : undefined}
                >
                  {t(item.label)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="button button--primary header-cta" href={SITE.skin}>
          {t("进入皮肤站")}
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <nav aria-label={t("页脚导航")}>
        <ul className="footer-nav">
          <li>
            <a href={PAGES.docs}>{t("使用文档")}</a>
          </li>
          <li>
            <a href={PAGES.jlmua}>{t("JLMUA")}</a>
          </li>
          <li>
            <ExternalLink href={SITE.mua.docs}>{t("MUA 官方文档")}</ExternalLink>
          </li>
          <li>
            <ExternalLink href={SITE.repositories["federated-server"]}>
              {t("联邦服务器")}
            </ExternalLink>
          </li>
        </ul>
      </nav>
      <p className="footer-note">
        {t("吉林省高校 Minecraft 联合体")} · {t("JLUCraft")}
      </p>
    </footer>
  );
}

/** 三个入口共用的骨架：跳转链接、页头、主区域、页脚。 */
export function Shell({
  page,
  children,
}: {
  page: PageKey;
  children: ReactNode;
}) {
  return (
    <>
      <Header page={page} />
      <main id="main" className="page-main">
        {children}
      </main>
      <Footer />
    </>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="section" {...(id ? { id } : {})}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function StepList({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="steps">
      {steps.map((step, index) => (
        <li key={step.title}>
          <span className="step-index" aria-hidden="true">
            {index + 1}
          </span>
          <div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return <p className="callout">{children}</p>;
}
