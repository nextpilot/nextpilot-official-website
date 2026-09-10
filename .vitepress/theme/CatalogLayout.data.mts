import { createContentLoader } from 'vitepress'
import { getCategoryName, getCategorySlug, getTagSlug, getDisplayTitle, stripSegmentPrefix } from '../config/page.mts'

/** 列表页 URL 前缀 → 目录名兜底（如 /product/01-aircraft/ → aircraft） */
function prefixFallback(prefix: string): string {
  const seg = prefix.split('/').filter(Boolean).pop() || ''
  return stripSegmentPrefix(seg)
}

/** 归一化 frontmatter.tags 为字符串数组（兼容误写单值字符串） */
function tagNames(frontmatter: Record<string, any>): string[] {
  const tags = frontmatter.tags || []
  return Array.isArray(tags) ? tags : [tags]
}

/**
 * 通用产品数据加载器（供 `layout: catalog` 列表页使用）。
 *
 * 收集全部 `layout: product` 页面（不绑定物理目录——放任何位置都会被收录）；
 * 每个产品默认归属「最近的 catalog 祖先」——即 URL 能作为其前缀的最近列表页
 * （`layout: catalog`，如 `/product/autopilot/`），用于默认分类名与组内排序。
 *
 * 每个产品带两个维度：与所属列表页同址的 `column`（栏目别名，仅导出供排查）与
 * `category`（分类，独立属性，默认取最近 catalog 列表页名称，可被 `frontmatter.category` 覆盖）。
 * 分类名（真相源）= `frontmatter.category` > 最近 catalog 列表页名称 > `uncategorized`；
 * 分类/标签 slug 由名称 slugify 推导（经全局 categoryMap / tagMap 覆盖）。
 */
// glob 相对 srcDir（source/）为物理路径：只收中文内容 zh/；item.url 经 rewrites 不带 zh/ 段
export default createContentLoader('zh/**/*.md', {
  includeSrc: true,
  transform(data) {
    // 列表页（layout: catalog）：URL 前缀 → 名称/排序（index 页 item.url 以 / 结尾，天然是前缀）
    const catalogs: { prefix: string; name: string; order: number }[] = []
    for (const item of data) {
      if (item.frontmatter.layout !== 'catalog') continue
      catalogs.push({
        prefix: item.url,
        name: getDisplayTitle(item.frontmatter, item.src || '', prefixFallback(item.url)),
        order: item.frontmatter.order ?? 999,
      })
    }

    // 最近的 catalog 祖先（前缀最长者胜）
    const nearestCatalog = (url: string) => {
      let best: (typeof catalogs)[number] | undefined
      for (const c of catalogs) {
        if (url.startsWith(c.prefix) && (!best || c.prefix.length > best.prefix.length)) best = c
      }
      return best
    }

    return data
      .filter((item) => item.frontmatter.layout === 'product') // 产品详情页（与目录无关）
      .filter((item) => item.frontmatter.draft !== true) // 排除草稿
      .map((item) => {
        const col = nearestCatalog(item.url)
        // 分类名（真相源）：frontmatter.category > 最近 catalog 列表页名称 > uncategorized
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
          column: col?.prefix || '', // 所属列表页前缀（即展示它的列表页）
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
