import { createContentLoader } from 'vitepress'
import { getCategoryName, getCategorySlug, getTagSlug, getDisplayTitle, stripSegmentPrefix } from '../config/page.mts'

/** 页面 URL → 子栏目目录名（去排序前缀），如 `/product/autopilot/fcs-v1.html` → `autopilot` */
function subcolumnDir(url: string): string {
  return stripSegmentPrefix(url.split('/').filter(Boolean)[1] || '')
}

/** 归一化 frontmatter.tags 为字符串数组（兼容误写单值字符串） */
function tagNames(frontmatter: Record<string, any>): string[] {
  const tags = frontmatter.tags || []
  return Array.isArray(tags) ? tags : [tags]
}

/**
 * 通用产品数据加载器（供 `layout: catalog` 布局使用）。
 *
 * 每个产品带两个维度：`column`（所属子栏目目录名，用于按栏目分组展示）与
 * `category`（分类，独立属性，默认取子栏目名，可被 `frontmatter.category` 覆盖）。
 * 分类名（真相源）= `frontmatter.category` > 子栏目名 > `uncategorized`；
 * 分类/标签 slug 由名称 slugify 推导（经全局 categoryMap / tagMap 覆盖）。
 */
export default createContentLoader('**/*.md', {
  includeSrc: true,
  transform(data) {
    // 子栏目目录名 -> 子栏目名/排序（从 product/<子栏目>/index.md 提取）
    const columns: Record<string, { name: string; order: number }> = {}
    for (const item of data) {
      if (!item.url.endsWith('/')) continue
      const seg = item.url.split('/').filter(Boolean)
      if (seg.length < 2 || seg[0] !== 'product') continue
      const dir = stripSegmentPrefix(seg[1])
      columns[dir] = {
        name: getDisplayTitle(item.frontmatter, item.src || '', dir),
        order: item.frontmatter.order ?? 999,
      }
    }

    return data
      .filter((item) => item.frontmatter.layout === 'product') // 产品详情页
      .filter((item) => item.frontmatter.draft !== true) // 排除草稿
      .map((item) => {
        const column = subcolumnDir(item.url)
        const col = columns[column]
        // 分类名（真相源）：frontmatter.category > 子栏目名 > uncategorized
        const categoryName = getCategoryName(item.frontmatter.category, col?.name)
        return {
          displayTitle: getDisplayTitle(item.frontmatter, item.src || ''),
          summary: item.frontmatter.summary || item.frontmatter.description || '',
          cover: item.frontmatter.cover || '',
          tags: tagNames(item.frontmatter).map((name) => ({ name, slug: getTagSlug(name) })),
          price: item.frontmatter.price ?? null,
          shopUrl: item.frontmatter.shopUrl || '',
          helpUrl: item.frontmatter.helpUrl || '',
          order: item.frontmatter.order ?? 999,
          url: item.url,
          column, // 所属子栏目（目录名），用于按栏目分组
          columnOrder: col?.order ?? 999,
          categoryName, // 分类名（独立属性）
          categorySlug: getCategorySlug(categoryName),
          // 全文搜索：原始 markdown 去掉 frontmatter
          searchText: (item.src || '').replace(/^---[\s\S]*?---\n?/, ''),
        }
      })
      .sort((a, b) => a.columnOrder - b.columnOrder || a.order - b.order || a.url.localeCompare(b.url))
  },
})
