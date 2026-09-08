<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
// @ts-expect-error `data` 由 VitePress 在构建期注入
import { data as allPosts } from './BlogLayout.data.mts'
import Breadcrumb from './components/Breadcrumb.vue'

const { page, lang } = useData()
const route = useRoute()

const query = ref('')
const activeCategory = ref('')
const activeTag = ref('')

// 分页：每页文章数
const pageSize = 10
const currentPage = ref(1)
const listEl = ref<HTMLElement>()

const isZh = computed(() => (lang.value || 'zh-CN').startsWith('zh'))
const t = computed(() =>
  isZh.value
    ? {
        all: '全部',
        placeholder: '搜索文章标题、关键词…',
        search: '搜索文章',
        empty: '没有匹配的文章。',
        cats: '文章分类',
        tagFilter: '标签',
        clearTag: '清除标签筛选',
        prev: '上一页',
        next: '下一页',
        pager: '分页导航',
        pageInfo: (cur: number, total: number) => `第 ${cur} / ${total} 页`,
        count: (n: number) => `共 ${n} 篇文章`,
      }
    : {
        all: 'All',
        placeholder: 'Search post title, keyword…',
        search: 'Search posts',
        empty: 'No matching posts.',
        cats: 'Categories',
        tagFilter: 'Tag',
        clearTag: 'Clear tag filter',
        prev: 'Previous',
        next: 'Next',
        pager: 'Pagination',
        pageInfo: (cur: number, total: number) => `Page ${cur} / ${total}`,
        count: (n: number) => `${n} post${n === 1 ? '' : 's'}`,
      },
)

// 从当前路径提取所属子栏目（栏目分组键）：/blog/<子栏目>/ → <子栏目>，/blog/ → 空（全部）
const column = computed(() => {
  const rel = (page.value.relativePath || '').replace(/\\/g, '/')
  const m = rel.match(/^blog\/([^/]+)\/index\.md$/)
  if (m) return m[1].replace(/^\d+-/, '') // 去排序前缀（如 `01-mavlink` → `mavlink`）
  // 回退到路由解析（处理 cleanUrls/语言前缀等差异）
  let p = route.path.replace(/\.html$/, '')
  if (p !== '/') p = p.replace(/\/+$/, '')
  const segs = p.split('/').filter(Boolean)
  if (segs[0] === 'en') segs.shift()
  return segs.length > 1 && segs[0] === 'blog' ? segs[1].replace(/^\d+-/, '') : ''
})

// 当前栏目下的文章（按子栏目分组；无子栏目则全部）
const posts = computed(() => {
  if (!column.value) return allPosts
  return allPosts.filter((p: any) => p.column === column.value)
})

// 分类列表：去重，保持出现顺序
const categories = computed(() => {
  const map = new Map<string, { slug: string; name: string }>()
  for (const p of posts.value) {
    if (!map.has(p.categorySlug)) map.set(p.categorySlug, { slug: p.categorySlug, name: p.categoryName })
  }
  return Array.from(map.values())
})

// 当前选中标签的显示名
const activeTagName = computed(() => {
  for (const p of posts.value) {
    const tag = p.tags.find((x: any) => x.slug === activeTag.value)
    if (tag) return tag.name
  }
  return activeTag.value
})

// 分类 + 标签 + 搜索筛选后的结果（数据加载器已按日期倒序排好）
const filtered = computed(() => {
  let list = posts.value
  if (activeCategory.value) {
    list = list.filter((p: any) => p.categorySlug === activeCategory.value)
  }
  if (activeTag.value) {
    list = list.filter((p: any) => p.tags.some((x: any) => x.slug === activeTag.value))
  }
  const q = query.value.trim().toLowerCase()
  if (q) {
    list = list.filter((p: any) => {
      const tagText = p.tags.map((x: any) => x.name).join(' ')
      const haystack = `${p.displayTitle} ${p.summary} ${p.categoryName} ${tagText} ${p.searchText}`.toLowerCase()
      return haystack.includes(q)
    })
  }
  return list
})

// 筛选/搜索条件变化时回到第 1 页
watch([query, activeCategory, activeTag], () => {
  currentPage.value = 1
})

// 总页数（筛选结果变化后自动收敛当前页，避免停留在越界页码）
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const current = computed(() => Math.min(currentPage.value, totalPages.value))

// 当前页要展示的文章
const paged = computed(() => {
  const start = (current.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

// 页码按钮：页数少时全列；多时首尾 + 当前页前后各 1 页，中间用省略号
const pageItems = computed<(number | '…')[]>(() => {
  const total = totalPages.value
  const cur = current.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const items: (number | '…')[] = [1]
  const start = Math.max(2, cur - 1)
  const end = Math.min(total - 1, cur + 1)
  if (start > 2) items.push('…')
  for (let i = start; i <= end; i++) items.push(i)
  if (end < total - 1) items.push('…')
  items.push(total)
  return items
})

function goTo(p: number) {
  const page = Number(p)
  if (!Number.isInteger(page) || page < 1 || page > totalPages.value || page === current.value) return
  currentPage.value = page
  // 翻页后平滑滚动回列表顶部（留出顶部导航高度）
  if (listEl.value) {
    const top = listEl.value.getBoundingClientRect().top + window.scrollY - 72
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

// 日期只显示到日：数据加载器已格式化为 YYYY-MM-DD；这里再兜底一次，
// 防止传入 Date 序列化出的 ISO 字符串（如 2026-09-08T00:00:00.000Z）把时分秒也显示出来
function fmtDate(d: unknown): string {
  if (!d) return ''
  const m = String(d).match(/\d{4}-\d{2}-\d{2}/)
  return m ? m[0] : String(d)
}
</script>

<template>
  <div class="blog-list-layout">
    <Breadcrumb />
    <div class="vp-doc">
      <Content />
    </div>

    <div class="blog-toolbar">
      <div class="blog-cats" role="group" :aria-label="t.cats">
        <button class="cat-chip" :class="{ active: activeCategory === '' }" @click="activeCategory = ''">{{ t.all }}</button>
        <button v-for="c in categories" :key="c.slug" class="cat-chip" :class="{ active: activeCategory === c.slug }" @click="activeCategory = c.slug">
          {{ c.name }}
        </button>
      </div>
      <input v-model="query" type="search" class="blog-search" :placeholder="t.placeholder" :aria-label="t.search" />
    </div>

    <div v-if="activeTag" class="blog-tagfilter">
      <span class="tagfilter-label">{{ t.tagFilter }}：</span>
      <button class="cat-chip active" :title="t.clearTag" @click="activeTag = ''">
        {{ activeTagName }} <span aria-hidden="true">×</span>
      </button>
    </div>

    <p v-if="!filtered.length" class="blog-empty">{{ t.empty }}</p>

    <template v-else>
      <p class="blog-count">{{ t.count(filtered.length) }}</p>

      <div ref="listEl" class="blog-list">
        <article v-for="p in paged" :key="p.url" class="post-item">
          <a :href="p.url" class="post-cover" :aria-label="p.displayTitle">
            <img v-if="p.cover" :src="p.cover" :alt="p.displayTitle" loading="lazy" />
            <span v-else class="cover-placeholder">{{ p.categoryName }}</span>
          </a>
          <div class="post-body">
            <div class="post-head">
              <h3 class="post-title">
                <a :href="p.url">{{ p.displayTitle }}</a>
              </h3>
              <div class="post-badges">
                <span class="badge badge-cat">{{ p.categoryName }}</span>
                <span v-if="p.date" class="badge badge-date">{{ fmtDate(p.date) }}</span>
                <span v-if="p.author" class="badge badge-author">{{ p.author }}</span>
              </div>
            </div>
            <p v-if="p.summary" class="post-summary">
              <a :href="p.url" class="summary-link">{{ p.summary }}</a>
            </p>
            <div v-if="p.tags.length" class="post-tags">
              <button v-for="tag in p.tags" :key="tag.slug" type="button" class="tag" :class="{ active: activeTag === tag.slug }" @click="activeTag = tag.slug">
                # {{ tag.name }}
              </button>
            </div>
          </div>
        </article>
      </div>

      <nav v-if="totalPages > 1" class="blog-pager" :aria-label="t.pager">
        <button type="button" class="pager-btn" :disabled="current <= 1" @click="goTo(current - 1)">{{ t.prev }}</button>
        <button
          v-for="(item, i) in pageItems"
          :key="i"
          type="button"
          class="pager-num"
          :class="{ active: item === current, ellipsis: item === '…' }"
          :disabled="item === '…'"
          @click="goTo(Number(item))"
        >
          {{ item }}
        </button>
        <button type="button" class="pager-btn" :disabled="current >= totalPages" @click="goTo(current + 1)">{{ t.next }}</button>
        <span class="pager-info">{{ t.pageInfo(current, totalPages) }}</span>
      </nav>
    </template>
  </div>
</template>

<style scoped>
.blog-list-layout {
  margin: 0 auto;
  padding: 24px 24px 32px;
}
.blog-list-layout :deep(.vp-doc) {
  max-width: none;
}

/* 与 VPDoc 页面保持一致的上/下/左右留白（桌面端 VPDoc 为 .VPDoc 32px + .content 32px 双层 padding） */
@media (min-width: 768px) {
  .blog-list-layout {
    padding: 24px 32px 32px;
  }
}

@media (min-width: 960px) {
  .blog-list-layout {
    padding: 24px 64px 32px;
  }
}

.blog-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
}
.blog-search {
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
.blog-search:focus {
  border-color: var(--vp-c-brand-1);
}
.blog-cats {
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
.blog-tagfilter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: -8px 0 16px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.blog-empty {
  margin: 32px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.blog-count {
  margin: 20px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

/* 一行一条的横向文章列表（桌面端固定行高，保证每条高度一致） */
.blog-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 16px 0 8px;
}
.post-item {
  display: flex;
  gap: 20px;
  height: 210px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
}
.post-item:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

/* 左侧缩略图：固定宽度、撑满行高 */
.post-cover {
  flex: 0 0 auto;
  align-self: stretch;
  width: 270px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}
.post-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.post-item:hover .post-cover img {
  transform: scale(1.03);
}
.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 12px;
  font-size: 14px;
  color: var(--vp-c-text-3);
  text-align: center;
}

/* 右侧正文 */
.post-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.post-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.post-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.25s;
}
.post-title a:hover {
  color: var(--vp-c-brand-1);
}
/* 标题行：左侧标题，右侧分类 / 日期徽标 */
.post-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px 12px;
}
.post-head .post-title {
  flex: 1 1 auto;
  min-width: 0;
}
.post-badges {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  margin: 2px 0 0 auto;
}
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 12px;
  line-height: 1.6;
  white-space: nowrap;
  border-radius: 999px;
}
.badge-cat {
  font-weight: 500;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft, rgba(100, 108, 255, 0.14));
}
.badge-date,
.badge-author {
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}
.post-summary {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.summary-link {
  color: inherit;
  text-decoration: none;
}
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
  padding-top: 4px;
}
.tag {
  padding: 2px 10px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  transition:
    color 0.25s,
    border-color 0.25s;
}
.tag:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.tag.active {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

/* 分页 */
.blog-pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 28px 0 8px;
}
.pager-btn,
.pager-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 34px;
  padding: 0 12px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  transition:
    color 0.25s,
    border-color 0.25s,
    background 0.25s;
}
.pager-num {
  padding: 0;
}
.pager-btn:hover:not(:disabled),
.pager-num:hover:not(:disabled):not(.ellipsis) {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.pager-num.active {
  color: #fff;
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.pager-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pager-num.ellipsis {
  min-width: auto;
  padding: 0 4px;
  border-color: transparent;
  background: transparent;
  cursor: default;
}
.pager-info {
  margin-left: 10px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

/* 窄屏：上下堆叠，行高自适应 */
@media (max-width: 640px) {
  .post-item {
    flex-direction: column;
    gap: 12px;
    height: auto;
  }
  .post-cover {
    width: 100%;
    height: 180px;
  }
}
</style>
