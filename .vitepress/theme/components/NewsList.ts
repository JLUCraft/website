import { defineComponent, h } from "vue";
import { data as posts } from "../news.data";

const dateFormat = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Shanghai",
});

function displayDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00+08:00`);
  return dateFormat.format(date);
}
export default defineComponent({
  name: "NewsList",
  setup() {
    return () =>
      h("div", { class: "news" }, [
        h("p", { class: "news-subscribe" }, [
          "想跟进更新，可以",
          h("a", { href: "/feed.xml" }, "订阅 RSS"),
          "。",
        ]),
        h(
          "ul",
          { class: "news-list" },
          posts.map((post) =>
            h("li", { key: post.url, class: "news-item" }, [
              h("a", { class: "news-link", href: post.url }, [
                h("time", { class: "news-date", datetime: post.date }, displayDate(post.date)),
                h("span", { class: "news-body" }, [
                  h("span", { class: "news-title" }, post.title),
                  h("span", { class: "news-desc" }, post.description),
                ]),
                ...(post.tag ? [h("span", { class: "news-tag" }, post.tag)] : []),
              ]),
            ]),
          ),
        ),
      ]);
  },
});
