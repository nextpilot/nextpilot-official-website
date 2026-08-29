<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'

const { page, theme, lang } = useData()
const route = useRoute()
const isZh = computed(() => (lang.value || 'zh-CN').startsWith('zh'))

interface Crumb {
  text: string
  link?: string
}

// 展开 nav（含下拉菜单 items），便于按链接反查栏目中文名
const navLinks = computed(() => {
  const flat: { text?: string; link: string }[] = []
  for (const item of theme.value.nav ?? []) {
    if ('link' in item && item.link) flat.push({ text: item.text, link: item.link })
    if ('items' in item && item.items) {
      for (const sub of item.items) {
        if ('link' in sub && sub.link) flat.push({ text: sub.text, link: sub.link })
      }
    }
  }
  return flat
})

const crumbs = computed<Crumb[]>(() => {
  // 归一化路径：去掉 .html 后缀与末尾斜杠
  let path = decodeURIComponent(route.path).replace(/\.html$/, '')
  if (path !== '/') path = path.replace(/\/$/, '')
  const segments = path.split('/').filter(Boolean)

  const items: Crumb[] = [{ text: isZh.value ? '首页' : 'Home', link: '/' }]

  // 一级栏目：从 nav（含下拉项）按链接匹配中文名，匹配不到回退到路径段
  const first = segments[0]
  if (first) {
    const link = `/${first}/`
    const navItem = navLinks.value.find((item) => item.link === link)
    items.push({ text: navItem?.text || first, link })
  }

  // 当前页：优先 frontmatter title，其次 page.title，最后路径末段
  if (segments.length > 1) {
    const fmTitle = page.value.frontmatter?.title as string | undefined
    items.push({
      text: fmTitle || page.value.title || segments[segments.length - 1],
    })
  }

  return items
})
</script>

<template>
  <nav v-if="crumbs.length > 1" class="breadcrumb" :aria-label="isZh ? '面包屑导航' : 'Breadcrumb'">
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
