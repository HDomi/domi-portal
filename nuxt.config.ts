// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // Enable SSR for pre-rendering static pages (SSG)
  ssr: true,

  // Global CSS/SCSS import
  css: ["~/assets/scss/main.scss"],

  // App configurations including SEO details
  app: {
    baseURL: "/",
    head: {
      title: "Domi Portal",
      htmlAttrs: {
        lang: "ko",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "도미가 개발하고 배포한 다양한 GitHub Pages 웹 프로젝트들을 한눈에 모아보고 검색할 수 있는 포탈 사이트입니다.",
        },
        { name: "format-detection", content: "telephone=no" },

        // Open Graph
        { property: "og:type", content: "website" },
        {
          property: "og:title",
          content: "Domi Portal",
        },
        {
          property: "og:description",
          content:
            "도미가 개발하고 배포한 다양한 GitHub Pages 웹 프로젝트들을 한눈에 모아보고 검색할 수 있는 포탈 사이트입니다.",
        },
        { property: "og:url", content: "https://hdomi.github.io/" },

        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Domi Portal",
        },
        {
          name: "twitter:description",
          content:
            "도미가 개발하고 배포한 다양한 GitHub Pages 웹 프로젝트들을 한눈에 모아보고 검색할 수 있는 포탈 사이트입니다.",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.png" }],
      script: [
        {
          src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3346442614533622",
          async: true,
          crossorigin: "anonymous",
        },
      ],
    },
  },
});
