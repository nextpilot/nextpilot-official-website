import { createContentLoader } from 'vitepress'
import { getCategoryName, getCategorySlug, getTagSlug, getDisplayTitle, stripSegmentPrefix } from '../config/page.mts'

/** 列表页 URL 前缀 → 目录名兜底（如 /blog/01-mavlink/ → mavlink） */
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
 * 文件名 `yyyymmdd-` 日期前缀（页面创建日期）。
 * 排序按该前缀倒序（见 CLAUDE.md 6.2）；frontmatter.date 仅用于展示、不参与排序。
 * 返回时间戳（无前缀返回 0，倒序时沉底）与格式化展示文本。
 */
function prefixDate(url: string): { ts: number; text: string } {
  const file = url.split('/').filter(Boolean).pop() || ''
  const m = file.match(/^(\d{4})(\d{2})(\d{2})-/)
  if (!m) return { ts: 0, text: '' }
  const ts = Date.parse(`${m[1]}-${m[2]}-${m[3]}`)
  return { ts: Number.isNaN(ts) ? 0 : ts, text: `${m[1]}-${m[2]}-${m[3]}` }
}

/** 展示日期格式化为 `YYYY-MM-DD`：frontmatter.date 会被 YAML 解析成 Date（日期-only 即 UTC 零点，序列化为 `...T00:00:00.000Z`），这里只取到日 */
function formatDate(d: unknown): string {
  if (!d) return ''
  if (d instanceof Date) return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
  const m = String(d).match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : ''
}

/** 摘要兜底：取正文首个有效段落（跳过标题/图片/表格/代码块/引用），去掉行内标记并截断 */
function firstParagraph(src: string): string {
  const body = src.replace(/^---[\s\S]*?---\n?/, '')
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('#') || line.startsWith('![') || line.startsWith('|') || line.startsWith('```') || line.startsWith('>')) continue
    return line.replace(/[*`]/g, '').slice(0, 120)
  }
  return ''
}

/** 列表型 layout：这些页面只承载列表/首页，不作为文章收录 */
const NON_POST_LAYOUTS = new Set(['home', 'catalog', 'blog', 'solution', 'product'])

/**
 * 通用博客文章数据加载器（供 `layout: blog` 列表页使用）。
 *
 * 不绑定物理目录：扫描全部 md，凡 URL 位于某个 `layout: blog` 列表页子树下的普通内容页
 * 都视为文章——把列表页放到任何目录，其下的文章都会被自动收录；嵌套列表页各自只展示本子树。
 *
 * 每篇文章带 `category`（分类，独立属性，默认取最近 blog 列表页名称，可被 `frontmatter.category` 覆盖）。
 * 分类名（真相源）= `frontmatter.category` > 最近 blog 列表页名称 > `uncategorized`；
 * 分类/标签 slug 由名称 slugify 推导（经全局 categoryMap / tagMap 覆盖）。
 * 排序：`frontmatter.order` 升序优先，其次按文件名 `yyyymmdd` 日期前缀倒序。
 */
// glob 相对 srcDir（source/）为物理路径：只收中文内容 zh/；item.url 经 rewrites 不带 zh/ 段
export default createContentLoader('zh/**/*.md', {
  includeSrc: true,
  transform(data) {
    // 博客列表页（layout: blog）：URL 前缀 → 名称/排序（index 页 item.url 以 / 结尾，天然是前缀）
    const blogs: { prefix: string; name: string; order: number }[] = []
    for (const item of data) {
      if (item.frontmatter.layout !== 'blog') continue
      blogs.push({
        prefix: item.url,
        name: getDisplayTitle(item.frontmatter, item.src || '', prefixFallback(item.url)),
        order: item.frontmatter.order ?? Infinity,
      })
    }

    // 最近的 blog 祖先（前缀最长者胜）
    const nearestBlog = (url: string) => {
      let best: (typeof blogs)[number] | undefined
      for (const b of blogs) {
        if (url.startsWith(b.prefix) && (!best || b.prefix.length > best.prefix.length)) best = b
      }
      return best
    }

    return data
      .filter((item) => !item.url.endsWith('/')) // 排除各级 index.md（栏目/子栏目首页）
      .filter((item) => !NON_POST_LAYOUTS.has(item.frontmatter.layout)) // 排除列表页/产品详情页等
      .filter((item) => item.frontmatter.draft !== true) // 排除草稿
      .filter((item) => nearestBlog(item.url)) // 仅收录 blog 列表页子树下的页面（与目录名无关）
      .map((item) => {
        const blog = nearestBlog(item.url)!
        // 分类名（真相源）：frontmatter.category > 最近 blog 列表页名称 > uncategorized
        const categoryName = getCategoryName(item.frontmatter.category, blog.name)
        const prefix = prefixDate(item.url)
        return {
          displayTitle: getDisplayTitle(item.frontmatter, item.src || ''),
          summary: item.frontmatter.summary || item.frontmatter.description || firstParagraph(item.src || ''),
          cover: item.frontmatter.cover || '',
          author: item.frontmatter.author || '',
          // 展示日期（YYYY-MM-DD）：frontmatter.date（仅展示）> 文件名日期前缀
          date: formatDate(item.frontmatter.date) || prefix.text || '',
          tags: tagNames(item.frontmatter).map((name) => ({ name, slug: getTagSlug(name) })),
          order: item.frontmatter.order ?? Infinity,
          dateTs: prefix.ts, // 文件名日期前缀时间戳，仅用于倒序排序
          url: item.url,
          categoryName, // 分类名（独立属性）
          categorySlug: getCategorySlug(categoryName),
          // 全文搜索：原始 markdown 去掉 frontmatter
          searchText: (item.src || '').replace(/^---[\s\S]*?---\n?/, ''),
        }
      })
      .sort((a, b) => a.order - b.order || b.dateTs - a.dateTs || a.url.localeCompare(b.url))
  },
})
