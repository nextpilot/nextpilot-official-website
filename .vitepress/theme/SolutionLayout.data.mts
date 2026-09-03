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

export default createContentLoader('solution/*.md', {
  includeSrc: true,
  transform(data) {
    return data
      .filter((item) => item.url !== '/solution/')
      .filter((item) => item.frontmatter.draft !== true)
      .sort((a, b) => (a.frontmatter.order ?? 999) - (b.frontmatter.order ?? 999))
      .map((item) => ({
        title: item.frontmatter.shortTitle || item.frontmatter.title || firstHeading(item.src || '') || titleFromUrl(item.url),
        cover: item.frontmatter.cover || '',
        summary: item.frontmatter.summary || item.frontmatter.description || '',
        url: item.url,
      }))
  },
})
