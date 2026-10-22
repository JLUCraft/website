import { Callout, ExternalLink, Section, Shell } from "../components/shell";
import { t } from "../i18n";
import { SITE } from "../site";

const TOC = [
  { id: "before", title: t("开始之前") },
  { id: "register", title: t("注册账号") },
  { id: "login", title: t("登录启动器") },
  { id: "join", title: t("加入服务器") },
  { id: "skins", title: t("皮肤与材质") },
  { id: "faq", title: t("常见问题") },
  { id: "admins", title: t("给社团管理员") },
];

const FAQ = [
  {
    title: t("收不到验证邮件怎么办？"),
    body: t(
      "先检查垃圾邮件目录；仍然收不到时，确认使用的是学校邮箱，并稍后重试。注册与重置密码都会发送验证邮件，短时间内多次请求可能被限流。",
    ),
  },
  {
    title: t("登录后游戏里没有皮肤？"),
    body: t(
      "确认皮肤站里已经上传并启用了材质，再重新登录启动器。材质由服务器在进入时下发，切换材质后需要重新进入服务器。",
    ),
  },
  {
    title: t("换了学校怎么办？"),
    body: t(
      "账号属于全省共用的皮肤站，不绑定某一所学校。用新的学校邮箱登记身份即可，不需要重新注册账号。",
    ),
  },
  {
    title: t("服务器连不上？"),
    body: t(
      "先确认启动器里已经登录，再确认服务器地址来自管理员最新的通知。联邦服务器各自部署在不同网络里，某一台故障不影响其他服务器。",
    ),
  },
];

const REPOS = [
  { label: t("皮肤站"), key: "skin-station" },
  { label: t("联邦服务器"), key: "federated-server" },
  { label: t("协议与身份库"), key: "union-core" },
  { label: t("启动器"), key: "launcher" },
  { label: t("管理端"), key: "union-manager" },
  { label: t("校徽取色"), key: "brand-palette" },
] as const;

export function DocsPage() {
  return (
    <Shell page="docs">
      <section className="hero hero--compact">
        <h1>{t("使用文档")}</h1>
        <p className="lead">
          {t("从注册账号到进入服务器，按顺序做即可。遇到问题先看常见问题一节。")}
        </p>
      </section>

      <nav className="toc" aria-label={t("本页内容")}>
        <h2>{t("本页内容")}</h2>
        <ul>
          {TOC.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.title}</a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="before" title={t("开始之前")}>
        <p>
          {t(
            "需要一台能运行 Minecraft Java 版的电脑，以及本联合体的启动器。启动器负责登录、材质与管理游戏实例。",
          )}
        </p>
        <p className="section-actions">
          <ExternalLink className="button button--primary" href={SITE.launcher}>
            {t("启动器下载")}
          </ExternalLink>
        </p>
      </Section>

      <Section id="register" title={t("注册账号")}>
        <p>
          {t(
            "打开皮肤站，选择注册，填写学校邮箱与密码。系统会向该邮箱发送验证邮件，验证链接在 15 分钟内有效。",
          )}
        </p>
        <Callout>
          {t("学校邮箱用于确认你所属的学校，请使用学校提供的邮箱地址，不要用个人邮箱。")}
        </Callout>
        <p className="section-actions">
          <a className="button button--primary" href={SITE.skin}>
            {t("进入皮肤站")}
          </a>
        </p>
      </Section>

      <Section id="login" title={t("登录启动器")}>
        <p>
          {t(
            "启动器里已经内置本联合体的认证服务器，选择它登录即可。若提示需要授权，按启动器给出的地址在浏览器里完成，然后回到启动器。",
          )}
        </p>
        <Callout>{t("请从本页或皮肤站下载启动器，不要使用来路不明的安装包。")}</Callout>
      </Section>

      <Section id="join" title={t("加入服务器")}>
        <p>
          {t(
            "玩家在游戏里使用离线账号，真实身份由联合体身份决定。因此进入服务器不需要另设密码，登录启动器就够了。",
          )}
        </p>
        <p>{t("服务器地址由各校管理员提供，也可以在启动器的房间/服务器列表里选择。")}</p>
      </Section>

      <Section id="skins" title={t("皮肤与材质")}>
        <p>
          {t(
            "在皮肤站上传皮肤与披风，可以设为私用或公开到公共皮肤库。公开的材质会出现在衣柜里，可以直接使用。",
          )}
        </p>
        <p>{t("材质由皮肤站统一签名，所有联邦服务器都从同一个地址取，不需要各校另配。")}</p>
      </Section>

      <Section id="faq" title={t("常见问题")}>
        <dl className="faq">
          {FAQ.map((entry) => (
            <div key={entry.title}>
              <dt>{entry.title}</dt>
              <dd>{entry.body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="admins" title={t("给社团管理员")}>
        <p>
          {t(
            "联合体由多个仓库组成：皮肤站提供账号与材质，联邦服务器负责身份、中继与赛事，启动器是玩家入口，管理端用于社团事务，配色由校徽取色工具生成。",
          )}
        </p>
        <ul className="repo-list">
          {REPOS.map((repo) => (
            <li key={repo.key}>
              <ExternalLink href={SITE.repositories[repo.key]}>{repo.label}</ExternalLink>
            </li>
          ))}
        </ul>
        <Callout>
          {t("部署与运维文档由各校负责人持有，接口条款以 MUA 官方文档为准。")}{" "}
          <ExternalLink href={SITE.mua.docs}>{t("MUA 官方文档")}</ExternalLink>
        </Callout>
      </Section>
    </Shell>
  );
}
