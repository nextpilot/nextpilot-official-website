import { createContentLoader } from 'vitepress'
import { getCategoryName, getCategorySlug, getTagSlug, getDisplayTitle, stripSegmentPrefix } from '../config/page.mts'

/** 文章 URL → 子栏目目录名（去排序前缀），如 `/blog/mavlink/xxx.html` → `mavlink`；直接挂在 blog/ 下返回空串 */
function subcolumnDir(url: string): string {
  const segs = url.split('/').filter(Boolean)
  return segs.length >= 3 && segs[0] === 'blog' ? stripSegmentPrefix(segs[1]) : ''
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

/**
 * 通用博客文章数据加载器（供 `layout: blog` 列表布局使用）。
 *
 * 每篇文章带两个维度：`column`（所属子栏目目录名，用于按子栏目分组展示）与
 * `category`（分类，独立属性，默认取子栏目名，可被 `frontmatter.category` 覆盖）。
 * 分类名（真相源）= `frontmatter.category` > 子栏目名（index.md 标题，缺失时回退目录名）> `uncategorized`；
 * 分类/标签 slug 由名称 slugify 推导（经全局 categoryMap / tagMap 覆盖）。
 * 排序：`frontmatter.order` 升序优先，其次按文件名 `yyyymmdd` 日期前缀倒序。
 */
// glob 相对 srcDir（source/）为物理路径：中文内容在 zh/ 下；item.url 经 rewrites 不带 zh/ 段
export default createContentLoader('zh/blog/**/*.md', {
  includeSrc: true,
  transform(data) {
    // 子栏目目录名 -> 子栏目名（从 blog/<子栏目>/index.md 提取，缺失时回退目录名）
    const columns: Record<string, string> = {}
    for (const item of data) {
      if (!item.url.endsWith('/')) continue
      const seg = item.url.split('/').filter(Boolean)
      if (seg.length < 2 || seg[0] !== 'blog') continue
      const dir = stripSegmentPrefix(seg[1])
      columns[dir] = getDisplayTitle(item.frontmatter, item.src || '', dir)
    }

    return data
      .filter((item) => !item.url.endsWith('/')) // 排除各级 index.md（栏目/子栏目首页）
      .filter((item) => item.frontmatter.layout !== 'blog') // 排除博客列表页自身
      .filter((item) => item.frontmatter.draft !== true) // 排除草稿
      .map((item) => {
        const column = subcolumnDir(item.url)
        // 分类名（真相源）：frontmatter.category > 子栏目名 > uncategorized
        const categoryName = getCategoryName(item.frontmatter.category, columns[column] || column)
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
          column, // 所属子栏目（目录名），用于按子栏目分组
          categoryName, // 分类名（独立属性）
          categorySlug: getCategorySlug(categoryName),
          // 全文搜索：原始 markdown 去掉 frontmatter
          searchText: (item.src || '').replace(/^---[\s\S]*?---\n?/, ''),
        }
      })
      .sort((a, b) => a.order - b.order || b.dateTs - a.dateTs || a.url.localeCompare(b.url))
  },
})
