<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'

const { page, theme } = useData()
const route = useRoute()

interface Crumb {
  text: string
  link?: string
}

const crumbs = computed<Crumb[]>(() => {
  // 归一化路径：去掉 .html 后缀与末尾斜杠
  let path = decodeURIComponent(route.path).replace(/\.html$/, '')
  if (path !== '/') path = path.replace(/\/$/, '')
  const segments = path.split('/').filter(Boolean)

  const items: Crumb[] = [{ text: '首页', link: '/' }]

  // 一级栏目：从 nav 里按链接匹配中文名，匹配不到就回退到路径段
  const first = segments[0]
  if (first) {
    const link = `/${first}/`
    const navItem = (theme.value.nav ?? []).find(
      (item) => 'link' in item && item.link === link
    )
    items.push({
      text: (navItem && 'text' in navItem && navItem.text) || first,
      link,
    })
  }

  // 当前页：优先 frontmatter title，其次路径末段
  if (segments.length > 1) {
    items.push({ text: page.value.title || segments[segments.length - 1] })
  }

  return items
})
</script>

<template>
  <nav v-if="crumbs.length > 1" class="breadcrumb" aria-label="面包屑导航">
    <template v-for="(c, i) in crumbs" :key="i">
      <span v-if="i > 0" class="sep" aria-hidden="true">/</span>
      <a v-if="c.link" :href="c.link" class="crumb">{{ c.text }}</a>
      <span v-else class="crumb current">{{ c.text }}</span>
    </template>
  </nav>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.4;
  color: var(--vp-c-text-2);
}
.sep {
  color: var(--vp-c-text-3);
}
.crumb {
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.25s;
}
a.crumb:hover {
  color: var(--vp-c-brand-1);
}
.crumb.current {
  color: var(--vp-c-text-1);
  font-weight: 500;
}
</style>
