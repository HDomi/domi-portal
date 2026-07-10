<template>
  <div class="app-container blog-detail-container">
    <!-- Ambient glow decorative circles -->
    <div class="ambient-glow-1"></div>
    <div class="ambient-glow-2"></div>

    <!-- Navigation Header -->
    <header class="blog-header">
      <NuxtLink to="/" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        <span>목록으로</span>
      </NuxtLink>

      <div class="blog-brand">
        <div class="logo-icon mini">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
        </div>
        <span class="brand-text">Domi Portal</span>
      </div>
    </header>

    <!-- Content Area -->
    <main v-if="post" class="blog-main-content">
      <article class="blog-article">
        <!-- Article Header -->
        <header class="article-meta-header">
          <div class="article-category">TECH BLOG</div>
          <h1 class="article-title">{{ post.title }}</h1>

          <div class="article-meta-info">
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                />
              </svg>
              <span>{{ formattedDate }}</span>
            </div>
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              <span>hdomi</span>
            </div>
          </div>

          <div v-if="post.tags && post.tags.length" class="article-tags">
            <span v-for="tag in post.tags" :key="tag" class="article-tag"> #{{ tag }} </span>
          </div>
        </header>

        <hr class="article-divider" />

        <!-- Article Body -->
        <section class="article-body markdown-body" v-html="parsedContent"></section>
      </article>
    </main>

    <!-- Error/Loading states -->
    <main v-else-if="error" class="error-container">
      <p>게시글을 불러오는 중에 오류가 발생했거나 존재하지 않는 게시글입니다.</p>
      <NuxtLink to="/" class="tag-btn active">홈으로 돌아가기</NuxtLink>
    </main>

    <!-- Footer -->
    <footer>
      <p>
        © {{ new Date().getFullYear() }}
        <a href="https://github.com/hdomi" target="_blank" rel="noopener noreferrer">hdomi</a>. All
        rights reserved.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useAsyncData, useSeoMeta, useHead, showError } from "#app";
import { marked } from "marked";

interface PostDetail {
  uuid: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  tags: string[];
}

const route = useRoute();
const postId = route.params.id as string;

// Fetch the individual post detail static JSON file (File read on server, fetch on client)
const { data: post, error } = await useAsyncData<PostDetail>(`post-${postId}`, async () => {
  if (process.server) {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const filePath = path.join(process.cwd(), "public/data/posts", `${postId}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8")) as PostDetail;
    }
    throw new Error("Post not found");
  } else {
    return $fetch(`/data/posts/${postId}.json`) as Promise<PostDetail>;
  }
});

// If there is an error, trigger Nuxt error screen or show custom error state
if (error.value) {
  showError({ statusCode: 404, statusMessage: "Post Not Found" });
}

// Format the date to a localized representation
const formattedDate = computed(() => {
  if (!post.value?.createdAt) return "";
  try {
    const date = new Date(post.value.createdAt);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
});

// Safely parse Markdown using marked library
const parsedContent = computed(() => {
  if (!post.value?.content) return "";
  try {
    // Return parsed markdown HTML
    return marked.parse(post.value.content);
  } catch (e) {
    console.error("Failed to parse Markdown:", e);
    return post.value.content;
  }
});

// Configure rich SEO meta headers dynamically for perfect crawler indexing
if (post.value) {
  useSeoMeta({
    title: `${post.value.title} | Domi Portal`,
    ogTitle: `${post.value.title} | Domi Portal`,
    description: post.value.summary || "도미의 개발 및 철학 블로그 포스트입니다.",
    ogDescription: post.value.summary || "도미의 개발 및 철학 블로그 포스트입니다.",
    ogType: "article",
    ogUrl: `https://hdomi.github.io/blog/${post.value.uuid}`,
    ogImage: "https://hdomi.github.io/favicon.png",
    twitterCard: "summary_large_image",
    twitterTitle: `${post.value.title} | Domi Portal`,
    twitterDescription: post.value.summary || "도미의 개발 및 철학 블로그 포스트입니다.",
  });

  useHead({
    htmlAttrs: {
      lang: "ko",
    },
    meta: [
      {
        name: "keywords",
        content: post.value.tags?.join(", ") || "Blog, Developer, AI",
      },
      { name: "author", content: "hdomi" },
    ],
  });
}
</script>
