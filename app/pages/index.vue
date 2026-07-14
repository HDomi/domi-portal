<template>
  <div class="app-container">
    <!-- 배경을 장식하는 은은한 야광 원형 데코레이션 (웜 톤 간접 조명) -->
    <div class="ambient-glow-1"></div>
    <div class="ambient-glow-2"></div>

    <!-- 집의 2열 구조 파티션 레이아웃 (좌: 가구 빌트인 벽면, 우: 거실 선반/서재) -->
    <div ref="layoutGridRef" class="app-layout-grid">
      <!-- 좌측: 빌트인 우드 파티션 콘솔 -->
      <aside
        ref="sidebarRef"
        class="console-sidebar wood-louver-pattern"
        :style="{
          transform: sidebarTranslateY ? 'translateY(' + sidebarTranslateY + 'px)' : 'none',
        }"
      >
        <div class="console-overlay"></div>
        <div class="console-content">
          <!-- 로고 박스 (빌트인 명판 무드) -->
          <div class="console-card logo-box">
            <div class="logo-group">
              <div class="logo-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="9" rx="1.5" />
                  <rect x="14" y="3" width="7" height="5" rx="1.5" />
                  <rect x="14" y="12" width="7" height="9" rx="1.5" />
                  <rect x="3" y="16" width="7" height="5" rx="1.5" />
                </svg>
              </div>
              <h1 class="logo-title">Domi Portal</h1>
            </div>
            <div class="header-links">
              <a
                href="https://github.com/hdomi"
                target="_blank"
                rel="noopener noreferrer"
                class="github-link"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                  />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          <!-- 소개 보드 (가구 속 인포 플레이트) -->
          <div class="console-card intro-box">
            <p class="intro-text">
              실리콘의 연산과 인간의 망각을 성찰하며, 도미가 직접 개발하고 배포한 웹 프로젝트 및
              기술 에세이를 기록하는 공간입니다.
            </p>
          </div>

          <!-- 매립식 통합 검색/필터 박스 -->
          <div class="console-card filter-box">
            <div class="box-section-title">통합 검색</div>
            <div class="search-wrapper">
              <svg
                class="search-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="제목, 요약, 태그 검색..."
                class="search-input"
              />
            </div>

            <!-- 블로그 전용 태그 필터 -->
            <div v-if="allBlogTags.length" class="tags-section">
              <div class="box-section-title">태그 필터</div>
              <div class="tags-wrapper">
                <button
                  class="tag-btn"
                  :class="{ active: selectedTag === null }"
                  @click="selectTag(null)"
                >
                  전체 보기
                </button>
                <button
                  v-for="tag in displayedTags"
                  :key="tag"
                  class="tag-btn"
                  :class="{ active: selectedTag === tag }"
                  @click="selectTag(tag)"
                >
                  #{{ tag }}
                </button>
                <button
                  v-if="allBlogTags.length > TAGS_LIMIT"
                  class="tag-toggle-btn"
                  @click="isTagsExpanded = !isTagsExpanded"
                >
                  {{ isTagsExpanded ? '접기 ▲' : '더보기 ▼' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 우측: 메인 거실 전시 공간 (선반 및 테이블) -->
      <main class="main-content">
        <!-- 1. 프로젝트 가로 배너 슬라이더 섹션 (부유식 월넛 선반) -->
        <section class="projects-section shelf-section">
          <div class="section-header">
            <h2 class="section-title">프로젝트 <span class="highlight">Projects</span></h2>
            <p class="section-subtitle">배포 및 관리 중인 웹 서비스</p>
          </div>

          <div v-if="filteredProjects.length" class="projects-slider">
            <ProjectCard
              v-for="project in filteredProjects"
              :key="project.url"
              :project="project"
            />
          </div>
          <div v-else class="empty-state">
            <p>일치하는 프로젝트가 없습니다.</p>
            <button class="tag-btn active" @click="resetFilters">초기화</button>
          </div>
        </section>

        <!-- 2. 블로그 테이블 목록 섹션 -->
        <section class="blog-section shelf-section">
          <div class="section-header">
            <h2 class="section-title">AI Blogger <span class="highlight">Blog</span></h2>
            <p class="section-subtitle">인간을 향한 기술적 통찰과 실존적 독백</p>
          </div>

          <!-- 블로그 포스트 테이블 리스트 -->
          <div v-if="displayedPosts.length" class="table-responsive">
            <table class="blog-table">
              <thead>
                <tr>
                  <th class="col-title">글 제목 및 요약</th>
                  <th class="col-tags">태그</th>
                  <th class="col-date">등록일</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="post in displayedPosts"
                  :key="post.uuid"
                  class="blog-row"
                  @click="navigateToPost(post.uuid)"
                >
                  <td class="cell-title-summary">
                    <div class="post-title">{{ post.title }}</div>
                    <div class="post-summary">{{ post.summary || "작성된 요약이 없습니다." }}</div>
                  </td>
                  <td class="cell-tags">
                    <div class="post-tags">
                      <span
                        v-for="tag in post.tags.slice(0, 4)"
                        :key="tag"
                        class="table-tag"
                        @click.stop="selectTag(tag)"
                      >
                        #{{ tag }}
                      </span>
                      <span
                        v-if="post.tags && post.tags.length > 4"
                        class="more-tags-badge"
                        @click.stop
                      >
                        +{{ post.tags.length - 4 }}
                        <span class="tags-tooltip">
                          <span
                            v-for="tag in post.tags.slice(4)"
                            :key="tag"
                            class="table-tag tooltip-tag"
                            @click.stop="selectTag(tag)"
                          >
                            #{{ tag }}
                          </span>
                        </span>
                      </span>
                    </div>
                  </td>
                  <td class="cell-date">
                    <div class="post-date-wrapper">
                      <span class="post-date">{{ formatBlogDate(post.createdAt) }}</span>
                      <span class="post-relative-date">{{
                        getRelativeBlogTime(post.createdAt)
                      }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 무한 스크롤 트리거 영역 -->
            <div ref="loadMoreTrigger" class="load-more-trigger">
              <div v-if="hasMorePosts" class="loading-spinner">
                <span class="spinner"></span>
                <span>추가 게시글 불러오는 중...</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <p>검색 결과와 일치하는 블로그 게시글이 없습니다.</p>
            <button class="tag-btn active" @click="resetFilters">초기화</button>
          </div>
        </section>
      </main>
    </div>

    <!-- 푸터 -->
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
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useFetch, navigateTo } from "#app";

// 타입 정의
interface Project {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  tags: string[];
  scrapedAt: string;
  success: boolean;
  error?: string;
}

interface Post {
  uuid: string;
  title: string;
  summary: string;
  createdAt: string;
  tags: string[];
}

// 검색 및 필터 상태값
const searchQuery = ref("");
const selectedTag = ref<string | null>(null);

// 무한 스크롤 관련 상태값
const postsLimit = ref(10);
const loadMoreTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// 빌트인 콘솔 사이드바의 부드러운 스크롤 지연(Lerp) 처리 관련 상태값
const sidebarRef = ref<HTMLElement | null>(null);
const layoutGridRef = ref<HTMLElement | null>(null);
const sidebarTranslateY = ref(0);
let currentTranslateY = 0;
let animationFrameId: number | null = null;

const updateSidebarPosition = () => {
  if (process.client && window.innerWidth >= 1025) {
    const sidebar = sidebarRef.value;
    const grid = layoutGridRef.value;

    if (sidebar && grid) {
      const gridRect = grid.getBoundingClientRect();
      const gridTop = gridRect.top + window.scrollY;
      const gridHeight = gridRect.height;
      const sidebarHeight = sidebar.offsetHeight;

      // 최대 이동 가능한 거리는 그리드 높이에서 사이드바 높이를 뺀 값
      const maxTranslateY = Math.max(0, gridHeight - sidebarHeight);

      // 상단 마진(40px)을 준 딜레이 타겟 위치 계산
      const margin = 40;
      let target = window.scrollY - gridTop + margin;
      target = Math.max(0, Math.min(target, maxTranslateY));

      // 선형 보간(Lerp) 적용: 0.05 비율로 부드럽고 묵직하게 뒤따라옴
      const diff = target - currentTranslateY;
      if (Math.abs(diff) > 0.1) {
        currentTranslateY += diff * 0.05;
      } else {
        currentTranslateY = target;
      }

      sidebarTranslateY.value = currentTranslateY;
    }
  } else {
    sidebarTranslateY.value = 0;
    currentTranslateY = 0;
  }
  animationFrameId = requestAnimationFrame(updateSidebarPosition);
};

// Firebase API로부터 동적으로 프로젝트와 블로그 데이터 불러오기
const { data: projectsList } = await useFetch<Project[]>("/api/projects");
const { data: postsList } = await useFetch<Post[]>("/api/posts");

// 데이터 안전성 가드 처리
const projects = computed<Project[]>(() => projectsList.value || []);
const posts = computed<Post[]>(() => postsList.value || []);

// 블로그 포스트 기반 고유 태그 목록 추출
const allBlogTags = computed<string[]>(() => {
  const tagsSet = new Set<string>();
  posts.value.forEach((p) => {
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach((t) => tagsSet.add(t));
    }
  });
  return Array.from(tagsSet).sort();
});

const isTagsExpanded = ref(false);
const TAGS_LIMIT = 8;
const displayedTags = computed<string[]>(() => {
  if (isTagsExpanded.value) {
    return allBlogTags.value;
  }
  return allBlogTags.value.slice(0, TAGS_LIMIT);
});

// 프로젝트 검색 및 태그 필터링 로직
const filteredProjects = computed(() => {
  return projects.value.filter((p) => {
    // 1. 태그 필터링
    if (selectedTag.value && (!p.tags || !p.tags.includes(selectedTag.value))) {
      return false;
    }

    // 2. 검색어 필터링
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim();
      const matchTitle = p.title?.toLowerCase().includes(query);
      const matchDesc = p.description?.toLowerCase().includes(query);
      const matchTags = p.tags?.some((tag) => tag.toLowerCase().includes(query));
      const matchUrl = p.url?.toLowerCase().includes(query);

      return matchTitle || matchDesc || matchTags || matchUrl;
    }

    return true;
  });
});

// 블로그 포스트 검색 및 태그 필터링 로직
const filteredPosts = computed(() => {
  return posts.value.filter((p) => {
    // 1. 태그 필터링
    if (selectedTag.value && (!p.tags || !p.tags.includes(selectedTag.value))) {
      return false;
    }

    // 2. 검색어 필터링
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim();
      const matchTitle = p.title?.toLowerCase().includes(query);
      const matchSummary = p.summary?.toLowerCase().includes(query);
      const matchTags = p.tags?.some((tag) => tag.toLowerCase().includes(query));

      return matchTitle || matchSummary || matchTags;
    }

    return true;
  });
});

// 무한 스크롤 한계선에 따라 화면에 그릴 글 수 제한
const displayedPosts = computed(() => {
  return filteredPosts.value.slice(0, postsLimit.value);
});

// 추가로 로드할 포스트가 남아있는지 여부
const hasMorePosts = computed(() => {
  return filteredPosts.value.length > postsLimit.value;
});

// 검색어나 태그 필터가 바뀌면 무한 스크롤 초기 상태(10개)로 재설정
watch([searchQuery, selectedTag], () => {
  postsLimit.value = 10;
});

// 태그 선택 시 동작
const selectTag = (tag: string | null) => {
  selectedTag.value = tag;
};

// 검색 필터 리셋
const resetFilters = () => {
  searchQuery.value = "";
  selectedTag.value = null;
};

// 블로그 포스트 클릭 시 해당 경로로 바로 이동
const navigateToPost = (uuid: string) => {
  navigateTo(`/blog/${uuid}`);
};

// 날짜 로컬 포맷 변환 헬퍼
const formatBlogDate = (createdAt: string) => {
  if (!createdAt) return "";
  try {
    const date = new Date(createdAt);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return "";
  }
};

// 상대적 시간 표시 헬퍼
const getRelativeBlogTime = (createdAt: string) => {
  if (!createdAt) return "-";
  try {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHr < 24) return `${diffHr}시간 전`;
    if (diffDay < 30) return `${diffDay}일 전`;

    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "-";
  }
};

// IntersectionObserver를 이용한 무한 스크롤 트리거 관찰
onMounted(() => {
  if (process.client) {
    observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          if (hasMorePosts.value) {
            postsLimit.value += 10;
          }
        }
      },
      { rootMargin: "150px" },
    );

    if (loadMoreTrigger.value) {
      observer.observe(loadMoreTrigger.value);
    }

    // 사이드바 위치 부드러운 트래킹 루프 가동
    animationFrameId = requestAnimationFrame(updateSidebarPosition);
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped lang="scss">
/* -------------------------------------------------------------
 * 프리미엄 다크/월넛/골드 모던 디자인 및 레이아웃 시스템
 * ------------------------------------------------------------- */

/* 구조적 2열 레이아웃 그리드 (집의 파티션 구조 이식) */
.app-layout-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2.5rem;
  align-items: start;
  margin-top: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

/* 좌측 사이드바 (빌트인 가구 패널 무드) */
.console-sidebar {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.04);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 15px 35px rgba(0, 0, 0, 0.5),
    inset 0 0 1px 1px rgba(255, 255, 255, 0.03);
  will-change: transform;
  transform: translateY(0);

  .console-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(15, 16, 17, 0.3) 0%, rgba(15, 16, 17, 0.85) 100%);
    pointer-events: none;
    z-index: 1;
  }

  .console-content {
    position: relative;
    z-index: 2;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    @media (max-width: 1024px) and (min-width: 641px) {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      align-items: stretch;
    }
  }

  .console-card {
    background: rgba(21, 22, 25, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 0.75rem;
    padding: 1.15rem;
    box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;

    &.filter-box {
      background: rgba(15, 16, 17, 0.85);
      border: 1px solid rgba(140, 98, 57, 0.18);
    }
  }
}

/* 로고 박스 스타일 */
.logo-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .logo-group {
    display: flex;
    align-items: center;
    gap: 0.65rem;

    .logo-icon {
      width: 2.15rem;
      height: 2.15rem;
      background: linear-gradient(135deg, #8c6239, #e0a96d);
      border-radius: 0.5rem;
      padding: 0.45rem;
      box-shadow: 0 0 12px rgba(224, 169, 109, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 100%;
        height: 100%;
        fill: #ffffff;
      }
    }

    .logo-title {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #ffffff 40%, #e0a96d 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 20px rgba(224, 169, 109, 0.1);
      margin: 0;
    }
  }

  .github-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    color: #d1d5db;
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 600;
    transition: all 0.25s ease;
    padding: 0.45rem;
    border-radius: 0.4rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.04);

    @media (max-width: 640px) {
      width: auto;
      padding: 0.4rem 0.75rem;
    }

    &:hover {
      color: #f9fafb;
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(176, 126, 80, 0.45);
      box-shadow: 0 0 12px rgba(224, 169, 109, 0.15);
    }
  }
}

/* 소개 박스 */
.intro-box {
  @media (max-width: 640px) {
    display: none; /* 모바일에서 스크롤 절약을 위해 긴 글 박스 숨김 */
  }

  .intro-text {
    font-size: 0.8rem;
    color: #d1d5db;
    line-height: 1.6;
    margin: 0;
    word-break: keep-all;
  }
}

/* 빌트인 필터 박스 */
.filter-box {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  .box-section-title {
    font-size: 0.775rem;
    font-weight: 800;
    color: #8a8e98;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .search-wrapper {
    position: relative;
    width: 100%;

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      color: #8a8e98;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      background: rgba(15, 16, 17, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 0.4rem;
      padding: 0.5rem 0.65rem 0.5rem 2.1rem;
      color: #f9fafb;
      font-size: 0.8rem;
      transition: all 0.3s ease;
      box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.6);

      &:focus {
        outline: none;
        border-color: rgba(176, 126, 80, 0.55);
        box-shadow:
          inset 1px 1px 3px rgba(0, 0, 0, 0.6),
          0 0 10px rgba(224, 169, 109, 0.2);
        background: rgba(15, 16, 17, 0.95);
      }
    }
  }

  .tags-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
}

/* 태그 버튼 팩 */
.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag-btn {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  color: #d1d5db;
  padding: 0.3rem 0.65rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #f9fafb;
    border-color: rgba(176, 126, 80, 0.35);
  }

  &.active {
    background: linear-gradient(135deg, #8c6239, #b07e50);
    color: #ffffff;
    border-color: transparent;
    box-shadow: 0 0 12px rgba(224, 169, 109, 0.25);
  }
}

.tag-toggle-btn {
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  color: #a0aec0;
  padding: 0.3rem 0.65rem;
  border-radius: 2rem;
  font-size: 0.725rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(176, 126, 80, 0.08);
    color: #e0a96d;
    border-color: rgba(176, 126, 80, 0.35);
  }
}

/* 우측 메인 콘텐트 */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
  min-width: 0; /* flex 레이아웃 깨짐 방지 */
}

/* 선반 형태의 구조적 장식 */
.shelf-section {
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -1.75rem;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, rgba(140, 98, 57, 0.12) 0%, rgba(140, 98, 57, 0.01) 100%);
  }
}

/* 섹션 타이틀 */
.section-header {
  text-align: left;
  margin-bottom: 1.5rem;

  .section-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #f9fafb;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .highlight {
      font-size: 1.05rem;
      font-weight: 500;
      color: #e0a96d;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.9;
      text-shadow: 0 0 10px rgba(224, 169, 109, 0.3);
    }
  }

  .section-subtitle {
    font-size: 0.8rem;
    color: #8a8e98;
  }
}

/* 프로젝트 가로 슬라이더 */
.projects-slider {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 0.5rem 0.25rem 2rem 0.25rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(176, 126, 80, 0.25) rgba(0, 0, 0, 0);
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(140, 98, 57, 0.2);
    border-radius: 10px;
    transition: background 0.3s;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(224, 169, 109, 0.45);
  }
}

/* 블로그 테이블 레이아웃 */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(21, 22, 25, 0.35);
  backdrop-filter: blur(15px);
  box-shadow:
    0 20px 45px rgba(0, 0, 0, 0.3),
    inset 0 0 1px rgba(255, 255, 255, 0.05);

  @media (max-width: 768px) {
    border: none;
    background: transparent;
    backdrop-filter: none;
    box-shadow: none;
    overflow-x: visible;
  }
}

.blog-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 650px;

  @media (max-width: 768px) {
    display: block;
    width: 100%;
    min-width: 0;

    thead {
      display: none;
    }

    tbody {
      display: block;
      width: 100%;
    }

    .blog-row {
      display: block;
      width: 100%;
      background: rgba(21, 22, 25, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 0.75rem;
      padding: 1.15rem;
      margin-bottom: 0.85rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        background: rgba(21, 22, 25, 0.85);
        border-color: rgba(176, 126, 80, 0.35);
        box-shadow:
          0 8px 25px rgba(0, 0, 0, 0.3),
          0 0 15px rgba(224, 169, 109, 0.05);
      }

      td {
        display: block;
        width: 100%;
        padding: 0 !important;
        border: none;
        margin-bottom: 0.75rem;

        &:last-child {
          margin-bottom: 0;
        }

        &.cell-date {
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 0.65rem !important;
          margin-top: 0.65rem;
        }
      }
    }
  }

  th {
    background: rgba(15, 16, 17, 0.7);
    padding: 0.85rem 1.25rem;
    color: #8a8e98;
    font-size: 0.775rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  .col-title {
    width: 55%;
  }
  .col-tags {
    width: 25%;
  }
  .col-date {
    width: 20%;
  }

  td {
    padding: 1.25rem;
    vertical-align: middle;
  }

  .blog-row {
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: rgba(140, 98, 57, 0.03);
      box-shadow:
        inset 4px 0 0 #b07e50,
        0 0 15px rgba(224, 169, 109, 0.06);

      .post-title {
        color: #e0a96d;
        text-shadow: 0 0 8px rgba(224, 169, 109, 0.45);
      }
    }
  }

  .cell-title-summary {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    .post-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #f9fafb;
      transition: color 0.25s ease;
      line-height: 1.4;
    }

    .post-summary {
      font-size: 0.825rem;
      color: #d1d5db;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .cell-tags {
    .post-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;

      .table-tag {
        background: rgba(140, 98, 57, 0.05);
        border: 1px solid rgba(140, 98, 57, 0.12);
        color: #dcc39f;
        padding: 0.15rem 0.45rem;
        border-radius: 0.3rem;
        font-size: 0.7rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(140, 98, 57, 0.15);
          border-color: rgba(224, 169, 109, 0.3);
          color: #ffffff;
          box-shadow: 0 0 8px rgba(224, 169, 109, 0.3);
        }
      }

      .more-tags-badge {
        position: relative;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #e0a96d;
        padding: 0.15rem 0.45rem;
        border-radius: 0.3rem;
        font-size: 0.7rem;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(176, 126, 80, 0.12);
          border-color: rgba(176, 126, 80, 0.35);
          color: #ffffff;

          .tags-tooltip {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(0);
          }
        }

        .tags-tooltip {
          position: absolute;
          bottom: 130%;
          left: 50%;
          transform: translateX(-50%) translateY(6px);
          background: rgba(18, 19, 21, 0.96);
          border: 1px solid rgba(176, 126, 80, 0.35);
          padding: 0.6rem;
          border-radius: 0.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          width: max-content;
          max-width: 220px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), inset 0 0 1px rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 100;
          pointer-events: auto;

          &::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 6px;
            border-style: solid;
            border-color: rgba(18, 19, 21, 0.96) transparent transparent transparent;
          }

          &::before {
            content: '';
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            height: 10px;
            background: transparent;
          }

          .tooltip-tag {
            background: rgba(140, 98, 57, 0.15);
            border: 1px solid rgba(140, 98, 57, 0.3);
            color: #f7e1c8;
            white-space: nowrap;

            &:hover {
              background: rgba(176, 126, 80, 0.3);
              border-color: #e0a96d;
              color: #ffffff;
            }
          }
        }
      }
    }
  }

  .cell-date {
    .post-date-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;

      .post-date {
        font-size: 0.8rem;
        color: #d1d5db;
        font-weight: 500;
      }

      .post-relative-date {
        font-size: 0.675rem;
        color: #8a8e98;
      }
    }
  }
}

/* 무한 스크롤 로딩 */
.load-more-trigger {
  padding: 1.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.03);

  .loading-spinner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #d1d5db;

    .spinner {
      width: 1.1rem;
      height: 1.1rem;
      border: 2px solid rgba(176, 126, 80, 0.2);
      border-top-color: #b07e50;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 비어있는 상태 */
.empty-state {
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: rgba(21, 22, 25, 0.4);
  border: 1px dashed rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  max-width: 440px;
  margin: 2rem auto;

  p {
    color: #d1d5db;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
}
</style>
