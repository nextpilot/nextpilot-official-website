<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'

interface Product {
  title: string
  shortTitle: string
  summary: string
  cover: string
  tags: string[]
  price: number | null
  shopUrl: string
  helpUrl: string
  url: string
  category: string
  categoryName: string
  categoryOrder: number
  searchText: string
}

const props = defineProps<{
  products: Product[]
}>()

// 未填写 shopUrl 时的兜底购买链接（与产品详情页 ProductLayout 保持一致）
const DEFAULT_SHOP_URL = 'https://ffvf62dgcrpcsf5h87lj12mrgn90rx5.taobao.com/'
// 未填写 helpUrl 时的兜底帮助链接（与产品详情页 ProductLayout 保持一致）
const DEFAULT_HELP_URL = '/manual/'

const query = ref('')
const activeCategory = ref('')

const { lang } = useData()
const isZh = computed(() => (lang.value || 'zh-CN').startsWith('zh'))
const t = computed(() =>
  isZh.value
    ? {
        all: '全部',
        placeholder: '搜索产品名称、型号、关键词…',
        search: '搜索产品',
        empty: '没有匹配的产品。',
        cats: '产品分类',
        buy: '购买',
        help: '帮助',
        priceOnRequest: '价格面议',
      }
    : {
        all: 'All',
        placeholder: 'Search product name, model, keyword…',
        search: 'Search products',
        empty: 'No matching products.',
        cats: 'Categories',
        buy: 'Buy',
        help: 'Help',
        priceOnRequest: 'Price on request',
      },
)

// 分类列表：去重，按 categoryOrder 排序
const categories = computed(() => {
  const map = new Map<string, { slug: string; name: string }>()
  for (const p of props.products) {
    if (!map.has(p.category)) map.set(p.category, { slug: p.category, name: p.categoryName })
  }
  return Array.from(map.values())
})

const filtered = computed(() => {
  let list = props.products
  if (activeCategory.value) {
    list = list.filter((p) => p.category === activeCategory.value)
  }
  const q = query.value.trim().toLowerCase()
  if (q) {
    list = list.filter((p) => {
      const haystack = `${p.title} ${p.shortTitle} ${p.summary} ${p.categoryName} ${p.tags.join(' ')} ${p.searchText}`.toLowerCase()
      return haystack.includes(q)
    })
  }
  return list
})
</script>

<template>
  <div class="product-toolbar">
    <div class="product-cats" role="group" :aria-label="t.cats">
      <button class="cat-chip" :class="{ active: activeCategory === '' }" @click="activeCategory = ''">
        {{ t.all }}
      </button>
      <button v-for="c in categories" :key="c.slug" class="cat-chip" :class="{ active: activeCategory === c.slug }" @click="activeCategory = c.slug">
        {{ c.name }}
      </button>
    </div>
    <input v-model="query" type="search" class="product-search" :placeholder="t.placeholder" :aria-label="t.search" />
  </div>

  <p v-if="!filtered.length" class="product-empty">{{ t.empty }}</p>

  <div class="product-grid">
    <div v-for="p in filtered" :key="p.url" class="product-card">
      <a :href="p.url" class="card-main">
        <img v-if="p.cover" :src="p.cover" :alt="p.title" class="card-cover" />
        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-title">{{ p.shortTitle || p.title }}</h3>
            <span class="card-cat">{{ p.categoryName }}</span>
          </div>
          <p v-if="p.summary" class="card-summary">{{ p.summary }}</p>
          <div v-if="p.tags.length" class="card-tags">
            <span v-for="t in p.tags" :key="t" class="tag">{{ t }}</span>
          </div>
        </div>
      </a>
      <div class="card-foot">
        <span class="card-price">{{ p.price != null ? `¥${p.price}` : t.priceOnRequest }}</span>
        <div class="card-actions">
          <a :href="p.shopUrl || DEFAULT_SHOP_URL" class="card-btn card-btn-buy" target="_blank" rel="noopener noreferrer">{{ t.buy }}</a>
          <a :href="p.helpUrl || DEFAULT_HELP_URL" class="card-btn card-btn-help">{{ t.help }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
}
.product-search {
  width: 260px;
  max-width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.25s;
}
.product-search:focus {
  border-color: var(--vp-c-brand-1);
}
.product-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
}
.cat-chip {
  padding: 6px 14px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  cursor: pointer;
  transition:
    color 0.25s,
    border-color 0.25s,
    background 0.25s;
}
.cat-chip:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.cat-chip.active {
  color: #fff;
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.product-empty {
  margin: 32px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 24px 0;
}
@media (max-width: 960px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
.product-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
}
.product-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.card-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-decoration: none;
  color: var(--vp-c-text-1);
}
.card-cover {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: cover;
  background: var(--vp-c-bg-soft);
}
.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}
.card-title-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}
.card-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}
.card-summary {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  padding: 2px 8px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
}
.card-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--vp-c-divider);
}
.card-cat {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.card-price {
  font-size: 15px;
  font-weight: 600;
  color: #e53935;
  white-space: nowrap;
}
.card-actions {
  display: flex;
  gap: 8px;
}
.card-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background 0.25s,
    border-color 0.25s,
    color 0.25s;
}
.card-btn-buy {
  color: #fff;
  background: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
}
.card-btn-buy:hover {
  background: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
}
.card-btn-help {
  color: var(--vp-c-brand-1);
  background: transparent;
  border: 1px solid var(--vp-c-brand-1);
}
.card-btn-help:hover {
  color: #fff;
  background: var(--vp-c-brand-1);
}
</style>
