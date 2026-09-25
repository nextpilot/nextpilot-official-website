import { createContentLoader } from 'vitepress'

// 提取 Markdown 一级标题，作为 frontmatter.title 缺失时的回退
function firstHeading(src: string) {
  const body = src.replace(/^---[\s\S]*?---\n?/, '')
  const match = body.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : ''
}

// 从 URL 末段提取文件名，去掉扩展名与排序前缀（两位整数或 yyyymmdd 日期）
function titleFromUrl(url: string) {
  const seg = url.split('/').filter(Boolean).pop() || ''
  const name = seg.replace(/\.(md|html)$/i, '')
  return name.replace(/^\d{2,8}-/, '')
}

/**
 * 通用解决方案数据加载器（供 `layout: solution` 列表页使用）。
 *
 * 不绑定物理目录：扫描全部 md，凡 URL 位于某个 `layout: solution` 列表页子树下的
 * 普通内容页（非 index、非其它列表布局、非草稿）都作为方案卡片收录。
 */
// glob 相对 srcDir（source/）为物理路径：中英文内容都收（zh/ 与 en/）。
// 方案列表页在两种语言下 URL 前缀不同（/solution/ 与 /en/solution/），前缀过滤天然分离。
export default createContentLoader('**/*.md', {
  includeSrc: true,
  transform(data) {
    // 方案列表页（layout: solution）的 URL 前缀（index 页 item.url 以 / 结尾，天然是前缀）
    const roots = data.filter((item) => item.frontmatter.layout === 'solution').map((item) => item.url)
    const underRoot = (url: string) => roots.some((prefix) => url.startsWith(prefix))

    return data
      .filter((item) => !item.url.endsWith('/')) // 排除各级 index.md（含列表页自身）
      .filter((item) => item.frontmatter.draft !== true)
      .filter((item) => !['home', 'catalog', 'blog', 'solution', 'product'].includes(item.frontmatter.layout))
      .filter((item) => underRoot(item.url)) // 仅收录 solution 列表页子树下的页面（与目录名无关）
      .sort((a, b) => (a.frontmatter.order ?? 999) - (b.frontmatter.order ?? 999))
      .map((item) => ({
        title: item.frontmatter.shortTitle || item.frontmatter.title || firstHeading(item.src || '') || titleFromUrl(item.url),
        cover: item.frontmatter.cover || '',
        summary: item.frontmatter.summary || item.frontmatter.description || '',
        url: item.url,
      }))
  },
})
