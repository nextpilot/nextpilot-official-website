<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
// @ts-expect-error `data` 由 VitePress 在构建期注入
import { data as titleMapData } from './Breadcrumb.data.mts'

const { lang } = useData()
const route = useRoute()
const isZh = computed(() => (lang.value || 'zh-CN').startsWith('zh'))

// 页面路由 -> 完整物理面包屑（顶级栏目 … 当前页），由 Breadcrumb.data.mts 按物理路径构建
const trails = titleMapData.trails as Record<string, { text: string; link?: string }[]>

interface Crumb {
  text: string
  link?: string
}

const crumbs = computed<Crumb[]>(() => {
  // 归一化路径：去掉 .html 后缀与末尾斜杠
  let path = decodeURIComponent(route.path).replace(/\.html$/, '')
  if (path !== '/') path = path.replace(/\/$/, '')

  const homeLink = isZh.value ? '/' : '/en/'
  const items: Crumb[] = [{ text: isZh.value ? '首页' : 'Home', link: homeLink }]

  // 物理路径分级的面包屑（已含顶级栏目与当前页，末项无链接）
  for (const c of trails[path] || []) items.push(c)

  return items
})
</script>

<template>
  <nav v-if="crumbs.length > 1" class="breadcrumb" :aria-label="isZh ? '面包屑导航' : 'Breadcrumb'">
    <template v-for="(c, i) in crumbs" :key="i">
      <span v-if="i > 0" class="sep" aria-hidden="true">/</span>
      <a v-if="c.link" :href="c.link" class="crumb">{{ c.text }}</a>
      <span v-else class="crumb" :class="{ current: i === crumbs.length - 1 }">{{ c.text }}</span>
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
