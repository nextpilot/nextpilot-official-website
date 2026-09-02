import { createContentLoader } from 'vitepress'

/** 解析展示标题：frontmatter.shortTitle > title > 一级标题（# ...） */
function resolveTitle(fm: { title?: string; shortTitle?: string } | undefined, content: string): string {
  if (fm?.shortTitle) return fm.shortTitle
  if (fm?.title) return fm.title
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const m = body.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : ''
}

/**
 * 面包屑标题映射：扫描所有 index.md，构建「目录 URL -> 标题」。
 * 供 Breadcrumb 组件把路径中间段（如 /product/autopilot/ 的 autopilot）解析为可读标题（飞行控制）。
 */
export default createContentLoader<Record<string, string>>('**/index.md', {
  includeSrc: true,
  transform(data) {
    const map: Record<string, string> = {}
    for (const item of data) {
      // 目录 index 的 url 以 / 结尾（如 /product/autopilot/）；无 title 时存空串，
      // 仅用「键是否存在」表示该目录是否有 index.md（决定面包屑是否可点击）
      if (item.url.endsWith('/')) {
        map[item.url] = resolveTitle(item.frontmatter as { title?: string; shortTitle?: string }, item.src || '')
      }
    }
    return map
  },
})
