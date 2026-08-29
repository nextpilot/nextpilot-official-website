import { createContentLoader } from 'vitepress'

export default createContentLoader('product/**/*.md', {
  includeSrc: true,
  transform(data) {
    // 分类 slug -> 分类名/排序（从分类 index.md 的 frontmatter 提取）
    const categories: Record<string, { name: string; order: number }> = {}
    for (const item of data) {
      if (!item.url.endsWith('/')) continue
      const seg = item.url.split('/').filter(Boolean)
      if (seg.length < 2) continue // 跳过顶层 /product/
      categories[seg[1]] = {
        name: item.frontmatter.title || seg[1],
        order: item.frontmatter.order ?? 999,
      }
    }

    return data
      .filter((item) => !item.url.endsWith('/')) // 排除分类 index.md
      .filter((item) => item.frontmatter.draft !== true) // 排除草稿
      .map((item) => {
        const seg = item.url.split('/').filter(Boolean)
        const category = seg[1] || ''
        const cat = categories[category]
        return {
          title: item.frontmatter.title || '',
          summary: item.frontmatter.summary || '',
          cover: item.frontmatter.cover || '',
          tags: item.frontmatter.tags || [],
          price: item.frontmatter.price ?? null,
          order: item.frontmatter.order ?? 999,
          url: item.url,
          category,
          categoryName: cat?.name || category,
          categoryOrder: cat?.order ?? 999,
          // 全文搜索：原始 markdown 去掉 frontmatter
          searchText: (item.src || '').replace(/^---[\s\S]*?---\n?/, ''),
        }
      })
      .sort(
        (a, b) =>
          a.categoryOrder - b.categoryOrder ||
          a.order - b.order ||
          a.url.localeCompare(b.url)
      )
  },
})
