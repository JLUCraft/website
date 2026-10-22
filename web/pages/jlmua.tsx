import { Callout, ExternalLink, Shell } from "../components/shell";
import { t } from "../i18n";
import { PAGES, SITE } from "../site";

const POINTS = [
  { title: t("联合认证"), body: t("玩家用本联合体的账号，就能登录加入 MUA 的其他高校服务器。") },
  { title: t("材质互通"), body: t("皮肤与披风按 MUA 规范同步，跨站也能看到同一身材质。") },
  {
    title: t("成员义务"),
    body: t("作为成员站，需要按规范提供服务器间接口并维护密钥。具体条款以 MUA 官方文档为准。"),
  },
];

export function JlmuaPage() {
  return (
    <Shell page="jlmua">
      <section className="hero">
        <p className="eyebrow">
          <span className="badge">{t("筹备中")}</span>
        </p>
        <h1>{t("JLMUA 落地页")}</h1>
        <p className="lead">
          {t("JLMUA 是本联合体与全国 MUA（Minecraft 高校联盟）对接的部分。")}
        </p>
        <p className="note">{t("这一页暂时寄生在 www.jlucraft.com 之下，独立站点就绪后会迁出。")}</p>
        <div className="actions">
          <a className="button button--primary" href={SITE.skin}>
            {t("进入皮肤站")}
          </a>
          <ExternalLink className="button button--secondary" href={SITE.mua.docs}>
            {t("MUA 官方文档")}
          </ExternalLink>
        </div>
      </section>

      <ul className="feature-grid">
        {POINTS.map((point) => (
          <li className="feature" key={point.title}>
            <h2>{point.title}</h2>
            <p>{point.body}</p>
          </li>
        ))}
      </ul>

      <Callout>
        {t("全国互通的具体条款以 MUA 官方文档为准。")}{" "}
        <ExternalLink href={SITE.mua.docs}>{t("MUA 官方文档")}</ExternalLink>
      </Callout>

      <p className="section-actions">
        <a className="button button--quiet" href={PAGES.home}>
          {t("返回首页")}
        </a>
      </p>
    </Shell>
  );
}
