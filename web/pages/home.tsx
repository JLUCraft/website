import { ExternalLink, Section, Shell, StepList } from "../components/shell";
import { t } from "../i18n";
import { PAGES, SITE } from "../site";

const FEATURES = [
  { title: t("一个皮肤站"), body: t("全省共用一套账号与材质，换学校不用重新注册。") },
  { title: t("多台联邦服务器"), body: t("各校自建服务器组成联邦，玩家之间互相可见、可联机。") },
  { title: t("与 MUA 互通"), body: t("按全国 MUA 规范接入，跨省也能认得出你。") },
];

const STEPS = [
  { title: t("用学校邮箱注册账号"), body: t("在皮肤站填写学校邮箱，收信验证后即可创建角色。") },
  { title: t("用启动器登录"), body: t("启动器内置本联合体的认证服务器，登录即完成身份绑定。") },
  { title: t("连接服务器进入游戏"), body: t("从启动器获取服务器地址，或由同学发来连接链接。") },
];

export function HomePage() {
  return (
    <Shell page="home">
      <section className="hero">
        <p className="eyebrow">{t("吉林省高校 Minecraft 联合体")}</p>
        <h1>{t("一个账号，加入全省高校的 Minecraft 社区")}</h1>
        <p className="lead">
          {t(
            "用学校邮箱注册一次，就能登录全省共用的皮肤站、进入各校的联邦服务器，并与全国 MUA 互通。",
          )}
        </p>
        <div className="actions">
          <a className="button button--primary" href={SITE.skin}>
            {t("进入皮肤站")}
          </a>
          <ExternalLink className="button button--secondary" href={SITE.launcher}>
            {t("下载启动器")}
          </ExternalLink>
        </div>
      </section>

      <ul className="feature-grid">
        {FEATURES.map((feature) => (
          <li className="feature" key={feature.title}>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
          </li>
        ))}
      </ul>

      <Section title={t("三步开始")}>
        <StepList steps={STEPS} />
        <p className="section-actions">
          <a className="button button--primary" href={SITE.skin}>
            {t("现在注册")}
          </a>
        </p>
      </Section>

      <div className="card-grid">
        <a className="card-link" href={PAGES.docs}>
          <h2>{t("使用文档")}</h2>
          <p>{t("使用文档简介")}</p>
        </a>
        <a className="card-link" href={PAGES.jlmua}>
          <h2>{t("JLMUA")}</h2>
          <p>{t("JLMUA简介")}</p>
        </a>
      </div>
    </Shell>
  );
}
