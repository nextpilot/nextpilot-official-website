<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import Breadcrumb from './components/Breadcrumb.vue'

const { frontmatter } = useData()

// 图库：优先 frontmatter.gallery（多图），否则回退单张 cover
const images = computed<string[]>(() => {
  const gallery = frontmatter.value.gallery
  if (Array.isArray(gallery) && gallery.length) return gallery as string[]
  return frontmatter.value.cover ? [frontmatter.value.cover as string] : []
})

const active = ref(0)

const displayTitle = computed(() => (frontmatter.value.shortTitle || frontmatter.value.title || '') as string)
const summary = computed(() => (frontmatter.value.summary || frontmatter.value.description || '') as string)

const price = computed(() => (frontmatter.value.price ?? null) as number | null)
const shopUrl = computed(() => (frontmatter.value.shopUrl || 'https://shop103678810.taobao.com') as string)
const tags = computed(() => (frontmatter.value.tags || []) as string[])

// 正文 tab 切换：事件委托，处理 markdown 渲染出的 `.heading-tab` 点击
function onTabClick(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest('.heading-tab') as HTMLElement | null
  if (!btn) return
  const root = btn.closest('.heading-tabs') as HTMLElement | null
  if (!root) return
  const idx = btn.dataset.tab
  root.querySelectorAll('.heading-tab').forEach((b) => {
    const el = b as HTMLElement
    const on = el.dataset.tab === idx
    el.classList.toggle('is-active', on)
    el.setAttribute('aria-selected', String(on))
  })
  root.querySelectorAll('.heading-tab-panel').forEach((p) => {
    const el = p as HTMLElement
    el.classList.toggle('is-active', el.dataset.panel === idx)
  })
}

onMounted(() => document.addEventListener('click', onTabClick))
onBeforeUnmount(() => document.removeEventListener('click', onTabClick))
</script>

<template>
  <div class="product-layout">
    <Breadcrumb />

    <div class="product-hero">
      <div class="gallery">
        <img v-if="images.length" :src="images[active]" :alt="frontmatter.title" class="gallery-main" />
        <div v-if="images.length > 1" class="gallery-thumbs">
          <button v-for="(img, i) in images" :key="img" type="button" class="thumb" :class="{ active: i === active }" :aria-label="`查看第 ${i + 1} 张图片`" @click="active = i">
            <img :src="img" :alt="frontmatter.title" />
          </button>
        </div>
      </div>

      <div class="summary">
        <h1 class="title">{{ displayTitle }}</h1>
        <p v-if="summary" class="summary-text">{{ summary }}</p>

        <div class="price">{{ price != null ? `¥${price}` : '价格面议' }}</div>

        <div class="actions">
          <a :href="shopUrl" class="btn btn-primary" target="_blank" rel="noopener noreferrer"> 立即购买 </a>
          <a href="/manual/" class="btn btn-secondary">帮助文档</a>
        </div>

        <div v-if="tags.length" class="tags">
          <span v-for="t in tags" :key="t" class="tag">{{ t }}</span>
        </div>
      </div>
    </div>

    <div class="product-body">
      <div class="vp-doc">
        <Content />
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-layout {
  margin: 0 auto;
  padding: 24px 24px 96px;
}

/* 与 VPDoc 页面保持一致的上/下/左右留白（桌面端 VPDoc 为 .VPDoc 32px + .content 32px 双层 padding） */
@media (min-width: 768px) {
  .product-layout {
    padding: 24px 32px 128px;
  }
}

@media (min-width: 960px) {
  .product-layout {
    padding: 24px 64px 128px;
  }
}

.product-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(280px, 46%, 600px);
  gap: 40px;
  margin: 24px 0 48px;
}

/* 图库 */
.gallery-main {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  max-height: 480px;
  object-fit: cover;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.gallery-thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}
.thumb {
  padding: 0;
  width: 72px;
  height: 54px;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: border-color 0.2s;
}
.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb:hover {
  border-color: var(--vp-c-divider);
}
.thumb.active {
  border-color: var(--vp-c-brand-1);
}

/* 摘要栏 */
.summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.title {
  margin: 0;
  font-size: 28px;
  line-height: 1.3;
  font-weight: 700;
}
.summary-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}
.price {
  font-size: 22px;
  font-weight: 700;
  color: #e53935;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 22px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  text-decoration: none;
  transition:
    background 0.25s,
    border-color 0.25s,
    color 0.25s;
}
.btn-primary {
  color: #fff;
  background: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
}
.btn-primary:hover {
  background: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
}
.btn-secondary {
  color: var(--vp-c-brand-1);
  background: transparent;
  border: 1px solid var(--vp-c-brand-1);
}
.btn-secondary:hover {
  color: #fff;
  background: var(--vp-c-brand-1);
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag {
  padding: 4px 10px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}

/* 正文：复用 VitePress 排版，放宽宽度以容纳宽表格 */
.product-body {
  margin-top: 16px;
}
.product-body :deep(.vp-doc) {
  max-width: none;
}

/* 正文 tabs（由 plugin-heading-tab 插件注入到 <Content /> 内，故用 :deep()） */
.product-body :deep(.heading-tabs) {
  margin-top: 8px;
}
.product-body :deep(.heading-tab-list) {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 24px;
}
.product-body :deep(.heading-tab) {
  padding: 10px 18px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;
}
.product-body :deep(.heading-tab:hover) {
  color: var(--vp-c-brand-1);
}
.product-body :deep(.heading-tab.is-active) {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
  font-weight: 700;
}
.product-body :deep(.heading-tab-panel) {
  display: none;
}
.product-body :deep(.heading-tab-panel.is-active) {
  display: block;
}
/* 面板内的 h2 标题与 tab 标签重复，且自带 border-top 会和 tab 栏的 border-bottom 叠成两条线，故隐藏 */
.product-body :deep(.heading-tab-panel > h2) {
  display: none;
}

@media (max-width: 768px) {
  .product-hero {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
