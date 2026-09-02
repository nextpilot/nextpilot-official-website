<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted } from 'vue'
import { onContentUpdated } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Breadcrumb from './components/Breadcrumb.vue'

const { Layout } = DefaultTheme

// 通用 `::: tabs` 容器切换：事件委托，处理 markdown 渲染出的 `.markdown-tab-btn`
function onTabsGroupClick(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest('.markdown-tab-btn') as HTMLElement | null
  if (!btn) return
  const root = btn.closest('.markdown-tab') as HTMLElement | null
  if (!root) return
  const idx = btn.dataset.tab
  root.querySelectorAll('.markdown-tab-btn').forEach((b) => {
    const el = b as HTMLElement
    const on = el.dataset.tab === idx
    el.classList.toggle('is-active', on)
    el.setAttribute('aria-selected', String(on))
  })
  root.querySelectorAll('.markdown-tab-panel').forEach((p) => {
    const el = p as HTMLElement
    el.classList.toggle('is-active', el.dataset.panel === idx)
  })
  syncTabsOutline()
}

// 根据激活的 tab 同步右侧 outline：隐藏非激活 tab 标题对应的目录项
function syncTabsOutline() {
  const activeIds = new Set<string>()
  const tabIds = new Set<string>()
  document.querySelectorAll('.markdown-tab-panel').forEach((panel) => {
    const isActive = panel.classList.contains('is-active')
    panel.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      if (h.id) {
        tabIds.add(h.id)
        if (isActive) activeIds.add(h.id)
      }
    })
  })
  document.querySelectorAll('.VPDocAsideOutline .outline-link').forEach((a) => {
    const id = (a as HTMLAnchorElement).getAttribute('href')?.slice(1)
    if (id && tabIds.has(id)) {
      const li = a.closest('li')
      if (li) (li as HTMLElement).style.display = activeIds.has(id) ? '' : 'none'
    }
  })
}

onMounted(() => document.addEventListener('click', onTabsGroupClick))
onBeforeUnmount(() => document.removeEventListener('click', onTabsGroupClick))

// 内容更新后（含初次渲染）同步 outline，双重 nextTick 保证 outline 已构建
onContentUpdated(() => {
  nextTick(() => nextTick(syncTabsOutline))
})
</script>

<template>
  <Layout>
    <template #doc-before>
      <Breadcrumb />
    </template>
  </Layout>
</template>
