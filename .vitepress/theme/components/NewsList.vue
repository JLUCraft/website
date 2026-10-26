<script setup lang="ts">
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
</script>

<template>
  <div class="news">
    <p class="news-subscribe">
      想跟进更新，可以<a href="/feed.xml">订阅 RSS</a>。
    </p>
    <ul class="news-list">
      <li v-for="post in posts" :key="post.url" class="news-item">
        <a class="news-link" :href="post.url">
          <time class="news-date" :datetime="post.date">{{ displayDate(post.date) }}</time>
          <span class="news-body">
            <span class="news-title">{{ post.title }}</span>
            <span class="news-desc">{{ post.description }}</span>
          </span>
          <span v-if="post.tag" class="news-tag">{{ post.tag }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>
