<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import DefaultTheme from 'vitepress/theme'
import Breadcrumb from './components/Breadcrumb.vue'

const { Layout } = DefaultTheme

// 通用 `::: tabs` 容器切换：事件委托，处理 markdown 渲染出的 `.tabs-group-btn`
function onTabsGroupClick(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest('.tabs-group-btn') as HTMLElement | null
  if (!btn) return
  const root = btn.closest('.tabs-group') as HTMLElement | null
  if (!root) return
  const idx = btn.dataset.tab
  root.querySelectorAll('.tabs-group-btn').forEach((b) => {
    const el = b as HTMLElement
    const on = el.dataset.tab === idx
    el.classList.toggle('is-active', on)
    el.setAttribute('aria-selected', String(on))
  })
  root.querySelectorAll('.tabs-group-panel').forEach((p) => {
    const el = p as HTMLElement
    el.classList.toggle('is-active', el.dataset.panel === idx)
  })
}

onMounted(() => document.addEventListener('click', onTabsGroupClick))
onBeforeUnmount(() => document.removeEventListener('click', onTabsGroupClick))
</script>

<template>
  <Layout>
    <template #doc-before>
      <Breadcrumb />
    </template>
  </Layout>
</template>
