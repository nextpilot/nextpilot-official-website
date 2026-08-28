<script setup lang="ts">
import { computed } from 'vue'

interface Solution {
  title: string
  cover: string
  summary: string
  url: string
}

const props = defineProps<{
  solutions: Solution[]
}>()

const items = computed(() =>
  props.solutions.map((s) => {
    const lines = s.summary.split('\n').map((l) => l.trim()).filter(Boolean)
    const intro = lines.find((l) => !l.startsWith('-')) ?? ''
    const bullets = lines
      .filter((l) => l.startsWith('-'))
      .map((l) => l.replace(/^-\s*/, ''))
    return { ...s, intro, bullets }
  })
)
</script>

<template>
  <div class="solution-grid">
    <a v-for="s in items" :key="s.url" :href="s.url" class="solution-card">
      <img v-if="s.cover" :src="s.cover" :alt="s.title" class="card-cover" />
      <h3 class="card-title">{{ s.title }}</h3>
      <p v-if="s.intro" class="card-intro">{{ s.intro }}</p>
      <ul v-if="s.bullets.length" class="card-bullets">
        <li v-for="b in s.bullets" :key="b">{{ b }}</li>
      </ul>
      <span class="card-more">查看详情 →</span>
    </a>
  </div>
</template>

<style scoped>
.solution-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 24px 0;
}
.solution-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: border-color 0.25s, box-shadow 0.25s;
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
</style>
