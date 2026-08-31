<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
// @ts-expect-error `data` 由 VitePress 在构建期注入
import { data as allProducts } from './CatalogLayout.data.mts'
import Breadcrumb from './components/Breadcrumb.vue'
import ProductList from './components/ProductList.vue'

const { page } = useData()
const route = useRoute()

// 从当前路径提取分类：/product/<cat>/ → <cat>，/product/ → 空（全部）
const category = computed(() => {
  const rel = (page.value.relativePath || '').replace(/\\/g, '/')
  const m = rel.match(/^product\/([^/]+)\/index\.md$/)
  if (m) return m[1]
  // 回退到路由解析（处理 cleanUrls/语言前缀等差异）
  let p = route.path.replace(/\.html$/, '')
  if (p !== '/') p = p.replace(/\/+$/, '')
  const segs = p.split('/').filter(Boolean)
  if (segs[0] === 'en') segs.shift()
  return segs.length > 1 && segs[0] === 'product' ? segs[1] : ''
})

const products = computed(() => {
  if (!category.value) return allProducts
  return allProducts.filter((p: any) => p.category === category.value)
})
</script>

<template>
  <div class="product-list-layout">
    <Breadcrumb />
    <div class="vp-doc">
      <Content />
    </div>
    <ProductList :products="products" />
  </div>
</template>

<style scoped>
.product-list-layout {
  margin: 0 auto;
  padding: 32px 24px 96px;
}
.product-list-layout :deep(.vp-doc) {
  max-width: none;
}

/* 与 VPDoc 页面保持一致的上/下/左右留白（桌面端 VPDoc 为 .VPDoc 32px + .content 32px 双层 padding） */
@media (min-width: 768px) {
  .product-list-layout {
    padding: 48px 32px 128px;
  }
}

@media (min-width: 960px) {
  .product-list-layout {
    padding: 48px 64px 128px;
  }
}
</style>
