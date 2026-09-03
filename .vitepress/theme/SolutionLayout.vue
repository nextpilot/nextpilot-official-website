<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
// @ts-expect-error `data` 由 VitePress 在构建期注入
import { data as solutions } from './SolutionLayout.data.mts'
import Breadcrumb from './components/Breadcrumb.vue'

const { lang } = useData()
const isZh = computed(() => (lang.value || 'zh-CN').startsWith('zh'))

// 解析每个解决方案的 summary 为 intro（首段）+ bullets（- 列表项）
const items = computed(() =>
  solutions.map((s: any) => {
    const lines = (s.summary || '')
      .split('\n')
      .map((l: string) => l.trim())
      .filter(Boolean)
    const intro = lines.find((l: string) => !l.startsWith('-')) ?? ''
    const bullets = lines.filter((l: string) => l.startsWith('-')).map((l: string) => l.replace(/^-\s*/, ''))
    return { ...s, intro, bullets }
  }),
)

// 根据条目数量决定列数，与首页 hero 卡片（VPFeatures）保持一致
const grid = computed(() => {
  const length = items.value.length
  if (!length) return ''
  if (length === 2) return 'grid-2'
  if (length === 3) return 'grid-3'
  if (length % 3 === 0) return 'grid-6'
  if (length > 3) return 'grid-4'
  return ''
})
</script>

<template>
  <div class="solution-layout">
    <Breadcrumb />
    <div class="vp-doc">
      <Content />
    </div>
    <div class="solution-grid">
      <a v-for="s in items" :key="s.url" :href="s.url" class="solution-card" :class="[grid]">
        <img v-if="s.cover" :src="s.cover" :alt="s.title" class="card-cover" />
        <h3 class="card-title">{{ s.title }}</h3>
        <p v-if="s.intro" class="card-intro">{{ s.intro }}</p>
        <ul v-if="s.bullets.length" class="card-bullets">
          <li v-for="b in s.bullets" :key="b">{{ b }}</li>
        </ul>
        <span class="card-more">{{ isZh ? '查看详情 →' : 'View details →' }}</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.solution-layout {
  margin: 0 auto;
  padding: 24px 24px 96px;
}
.solution-layout :deep(.vp-doc) {
  max-width: none;
}

/* 与 VPDoc 页面保持一致的上/下/左右留白 */
@media (min-width: 768px) {
  .solution-layout {
    padding: 24px 32px 128px;
  }
}

@media (min-width: 960px) {
  .solution-layout {
    padding: 24px 64px 128px;
  }
}

.solution-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 24px -8px;
}
.solution-card {
  display: flex;
  flex-direction: column;
  margin: 8px;
  width: 100%;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  overflow: hidden;
}
.solution-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.card-cover {
  display: block;
  width: calc(100% + 40px);
  height: 140px;
  object-fit: cover;
  margin: -20px -20px 16px;
  background: var(--vp-c-bg-soft);
}
.card-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
}
.card-intro {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.card-bullets {
  margin: 0 0 12px;
  padding-left: 18px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.card-bullets li {
  margin: 4px 0;
}
.card-more {
  margin-top: auto;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

@media (min-width: 640px) {
  .solution-card.grid-2,
  .solution-card.grid-4,
  .solution-card.grid-6 {
    width: calc(50% - 16px);
  }
}

@media (min-width: 768px) {
  .solution-card.grid-2,
  .solution-card.grid-4 {
    width: calc(50% - 16px);
  }

  .solution-card.grid-3,
  .solution-card.grid-6 {
    width: calc(33.3333% - 16px);
  }
}

@media (min-width: 960px) {
  .solution-card.grid-4 {
    width: calc(25% - 16px);
  }
}
</style>
