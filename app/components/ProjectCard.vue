<template>
  <a :href="project.url" target="_blank" rel="noopener noreferrer" class="project-card-link">
    <div class="project-card">
      <!-- Walnut wood trim top bar -->
      <div class="card-wood-trim"></div>

      <!-- Project Thumbnail -->
      <div class="card-image-container">
        <img
          v-if="project.image"
          :src="project.image"
          :alt="project.title"
          class="card-image"
          loading="lazy"
          @error="handleImageError"
        />
        <!-- Fallback design when image is missing or fails to load -->
        <div v-else class="card-image-fallback">
          <svg
            class="fallback-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
            />
          </svg>
          <span>{{ project.siteName }}</span>
        </div>
        <!-- Domain Badge -->
        <span class="card-badge">{{ project.siteName }}</span>
      </div>

      <!-- Project Metadata Details -->
      <div class="card-body">
        <h3 class="card-title">{{ project.title }}</h3>
        <p class="card-desc">{{ project.description }}</p>

        <!-- Tags list -->
        <div v-if="project.tags && project.tags.length" class="card-tags">
          <span v-for="tag in project.tags.slice(0, 4)" :key="tag" class="card-tag">
            #{{ tag }}
          </span>
        </div>

        <!-- Card Footer Actions -->
        <div class="card-footer">
          <span class="last-updated"> 수집일: {{ formattedDate }} </span>
          <span class="visit-indicator">
            <span>방문</span>
            <svg viewBox="0 0 24 24" class="arrow-icon">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </a>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

// 이미지 로드 실패 시 대체 표시 로직
const handleImageError = (event) => {
  event.target.style.display = "none";
  const container = event.target.parentElement;
  if (container) {
    const fallback = document.createElement("div");
    fallback.className = "card-image-fallback";
    fallback.innerHTML = `
      <svg class="fallback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
      <span>${props.project.siteName}</span>
    `;
    container.appendChild(fallback);
  }
};

// 날짜 형식 변환
const formattedDate = computed(() => {
  if (!props.project.scrapedAt) return "-";
  try {
    const date = new Date(props.project.scrapedAt);
    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "-";
  }
});
</script>

<style scoped lang="scss">
.project-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  flex-shrink: 0;
  width: 320px;
}

.project-card {
  height: 100%;
  border-radius: 0.75rem;
  background: rgba(21, 22, 25, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(176, 126, 80, 0.45);
    box-shadow:
      0 15px 35px rgba(0, 0, 0, 0.4),
      0 0 25px rgba(224, 169, 109, 0.15);

    .card-image {
      transform: scale(1.05);
    }

    .card-wood-trim {
      box-shadow: 0 2px 10px rgba(224, 169, 109, 0.85);
    }

    .visit-indicator {
      color: #e0a96d;
      text-shadow: 0 0 8px rgba(224, 169, 109, 0.6);
      .arrow-icon {
        transform: translate(2px, -2px);
        stroke: #e0a96d;
        filter: drop-shadow(0 0 4px rgba(224, 169, 109, 0.6));
      }
    }
  }
}

.card-wood-trim {
  width: 100%;
  height: 6px;
  background: linear-gradient(to right, #8c6239, #b07e50, #8c6239);
  position: relative;
  z-index: 2;
  transition: box-shadow 0.4s ease;
}

.card-image-container {
  width: 100%;
  height: 150px;
  position: relative;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(140, 98, 57, 0.12) 0%, rgba(224, 169, 109, 0.08) 100%);
  color: #8a8e98;
  gap: 0.5rem;

  .fallback-icon {
    width: 2.5rem;
    height: 2.5rem;
    opacity: 0.6;
  }
}

.card-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(15, 16, 17, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(4px);
  color: #d1d5db;
  padding: 0.25rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.725rem;
  font-weight: 600;
}

.card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-title {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: #f9fafb;
  font-weight: 700;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc {
  font-size: 0.875rem;
  color: #d1d5db;
  margin-bottom: 1rem;
  line-height: 1.55;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.card-tag {
  background: rgba(140, 98, 57, 0.06);
  border: 1px solid rgba(140, 98, 57, 0.15);
  color: #dcc39f;
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
  font-size: 0.7rem;
  font-weight: 500;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding-top: 0.75rem;
  margin-top: auto;
}

.last-updated {
  font-size: 0.7rem;
  color: #8a8e98;
}

.visit-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #dcc39f;
  transition: all 0.3s ease;

  .arrow-icon {
    width: 0.95rem;
    height: 0.95rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    transition: transform 0.3s ease;
  }
}
</style>
