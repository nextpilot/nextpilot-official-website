import { createContentLoader } from 'vitepress'

/**
 * 通用产品数据加载器（供 `layout: catalog` 布局使用）。
 *
 * 不绑定具体栏目目录：扫描所有 `.md`，以 `frontmatter.layout === 'product'`
 * 识别产品详情页。分类（slug）取 URL 第二段（`<栏目>/<分类>/<产品>`），
 * 分类显示名/排序取该分类 `index.md` 的 frontmatter。
 */
export default createContentLoader('**/*.md', {
  includeSrc: true,
  transform(data) {
    // 分类 slug -> 名称/排序（从 /<栏目>/<分类>/index.md 提取）
    const categories: Record<string, { name: string; order: number }> = {}
    for (const item of data) {
      if (!item.url.endsWith('/')) continue
      const seg = item.url.split('/').filter(Boolean)
      if (seg.length < 2) continue
      categories[seg[1]] = {
        name: item.frontmatter.shortTitle || item.frontmatter.title || seg[1],
        order: item.frontmatter.order ?? 999,
      }
    }

    return data
      .filter((item) => item.frontmatter.layout === 'product') // 产品详情页
      .filter((item) => item.frontmatter.draft !== true) // 排除草稿
      .map((item) => {
        const seg = item.url.split('/').filter(Boolean)
        // 分类标识（slug）：优先 frontmatter.category，否则用 URL 第二段（分类目录名）
        const category = item.frontmatter.category || seg[1] || ''
        const cat = categories[category]
        return {
          title: item.frontmatter.title || '',
          shortTitle: item.frontmatter.shortTitle || '',
          summary: item.frontmatter.summary || item.frontmatter.description || '',
          cover: item.frontmatter.cover || '',
          tags: item.frontmatter.tags || [],
          price: item.frontmatter.price ?? null,
          shopUrl: item.frontmatter.shopUrl || '',
          helpUrl: item.frontmatter.helpUrl || '',
          order: item.frontmatter.order ?? 999,
          url: item.url,
          category,
          categoryName: cat?.name || category,
          categoryOrder: cat?.order ?? 999,
          // 全文搜索：原始 markdown 去掉 frontmatter
          searchText: (item.src || '').replace(/^---[\s\S]*?---\n?/, ''),
        }
      })
      .sort((a, b) => a.categoryOrder - b.categoryOrder || a.order - b.order || a.url.localeCompare(b.url))
  },
})
