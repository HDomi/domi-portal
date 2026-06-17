<template>
  <div class="app-container">
    <!-- Ambient glow decorative circles -->
    <div class="ambient-glow-1"></div>
    <div class="ambient-glow-2"></div>

    <!-- Header navigation -->
    <header>
      <div class="logo-group">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
        </div>
        <span class="logo-text">Domi Portal</span>
      </div>
      <div class="header-links">
        <a
          href="https://github.com/hdomi"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            width="20"
            height="20"
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
    </header>

    <!-- Main Hero -->
    <section class="hero">
      <h1>Domi Portal</h1>
      <p>
        제가 직접 개발하고 배포한 다양한 웹 프로젝트들을 한눈에 감상하고
        확인하실 수 있습니다.
      </p>
    </section>

    <!-- Controls (Search & Tags) -->
    <div class="controls">
      <!-- Search Input -->
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
          placeholder="프로젝트 제목, 설명 또는 태그 검색..."
          class="search-input"
        />
      </div>

      <!-- Tag Filter pills -->
      <div v-if="allTags.length" class="tags-wrapper">
        <button
          class="tag-btn"
          :class="{ active: selectedTag === null }"
          @click="selectTag(null)"
        >
          전체 보기
        </button>
        <button
          v-for="tag in allTags"
          :key="tag"
          class="tag-btn"
          :class="{ active: selectedTag === tag }"
          @click="selectTag(tag)"
        >
          #{{ tag }}
        </button>
      </div>
    </div>

    <!-- Project List Grid -->
    <main>
      <div v-if="filteredProjects.length" class="project-grid">
        <ProjectCard
          v-for="project in filteredProjects"
          :key="project.url"
          :project="project"
        />
      </div>

      <!-- Empty state if search has no results -->
      <div v-else class="empty-state">
        <p>검색 결과와 일치하는 프로젝트가 없습니다.</p>
        <button class="tag-btn active" @click="resetFilters">초기화</button>
      </div>
    </main>

    <!-- Footer -->
    <footer>
      <p>
        © {{ new Date().getFullYear() }}
        <a
          href="https://github.com/hdomi"
          target="_blank"
          rel="noopener noreferrer"
          >hdomi</a
        >. All rights reserved.
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import projectsData from "../../public/data/projects-metadata.json";

// Wrap raw data
const projects = computed(() => projectsData || []);

// Search & filter states
const searchQuery = ref("");
const selectedTag = ref(null);

// Get unique tags list across all projects
const allTags = computed(() => {
  const tagsSet = new Set();
  projects.value.forEach((p) => {
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach((t) => tagsSet.add(t));
    }
  });
  return Array.from(tagsSet).sort();
});

// Filter logic
const filteredProjects = computed(() => {
  return projects.value.filter((p) => {
    // 1. Tag filtering
    if (selectedTag.value && (!p.tags || !p.tags.includes(selectedTag.value))) {
      return false;
    }

    // 2. Search query filtering
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim();
      const matchTitle = p.title?.toLowerCase().includes(query);
      const matchDesc = p.description?.toLowerCase().includes(query);
      const matchTags = p.tags?.some((tag) =>
        tag.toLowerCase().includes(query),
      );
      const matchUrl = p.url?.toLowerCase().includes(query);

      return matchTitle || matchDesc || matchTags || matchUrl;
    }

    return true;
  });
});

// Select tag action
const selectTag = (tag) => {
  selectedTag.value = tag;
};

// Reset actions
const resetFilters = () => {
  searchQuery.value = "";
  selectedTag.value = null;
};
</script>
