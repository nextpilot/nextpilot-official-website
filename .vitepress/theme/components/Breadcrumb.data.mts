import { createContentLoader } from 'vitepress'
import { resolveTitle } from '../../title.mts'

/**
 * 面包屑标题映射：扫描所有 index.md，构建「目录 URL -> 标题」。
 * 供 Breadcrumb 组件把路径中间段（如 /product/controller/ 的 controller）解析为可读标题（控制器）。
 */
export default createContentLoader<Record<string, string>>('**/index.md', {
  includeSrc: true,
  transform(data) {
    const map: Record<string, string> = {}
    for (const item of data) {
      // 目录 index 的 url 以 / 结尾（如 /product/controller/）；无 title 时存空串，
      // 仅用「键是否存在」表示该目录是否有 index.md（决定面包屑是否可点击）
      if (item.url.endsWith('/')) {
        map[item.url] = resolveTitle(item.frontmatter.title as string | undefined, item.src || '')
      }
    }
    return map
  },
})
