<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
// @ts-expect-error `data` 由 VitePress 在构建期注入
import { data as titleMapData } from './Breadcrumb.data.mts'

const { page, theme, lang } = useData()
const route = useRoute()
const isZh = computed(() => (lang.value || 'zh-CN').startsWith('zh'))

// 目录 URL -> 标题（来自各 index.md 的 frontmatter.title）
const titleMap = titleMapData as Record<string, string>

/** 去除目录名/文件名的排序前缀（形如 01-） */
function stripSortPrefix(name: string): string {
  return name.replace(/^\d+-/, '')
}

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

  // 英文站去掉语言前缀 en，避免把 en 当成一级栏目
  if (!isZh.value && segments[0] === 'en') segments.splice(0, 1)

  const homeLink = isZh.value ? '/' : '/en/'
  const items: Crumb[] = [{ text: isZh.value ? '首页' : 'Home', link: homeLink }]

  // 一级栏目：从 nav（含下拉项）按链接匹配栏目名，匹配不到回退到路径段
  if (segments[0]) {
    const link = `/${segments[0]}/`
    const navItem = navLinks.value.find((item) => item.link === link)
    items.push({ text: navItem?.text || stripSortPrefix(segments[0]), link })
  }

  // 中间目录段：index.md 标题，回退为去掉排序前缀的目录名
  for (let i = 1; i < segments.length - 1; i++) {
    const dirUrl = '/' + segments.slice(0, i + 1).join('/') + '/'
    const text = titleMap[dirUrl] || stripSortPrefix(segments[i])
    // 仅当该目录存在 index.md 时才生成可点击链接，否则为纯文本，避免指向 404
    items.push(dirUrl in titleMap ? { text, link: dirUrl } : { text })
  }

  // 当前页：优先 frontmatter title，其次 page.title，最后路径末段（去前缀）
  if (segments.length > 1) {
    const fmTitle = page.value.frontmatter?.title as string | undefined
    items.push({
      text: fmTitle || page.value.title || stripSortPrefix(segments[segments.length - 1]),
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
