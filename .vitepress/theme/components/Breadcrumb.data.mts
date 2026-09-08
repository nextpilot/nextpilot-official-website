import { readFileSync } from 'node:fs'
import { join, posix } from 'node:path'
import { getDisplayTitle, getDisplayTitleFromFile, getFinalUrl, isIndexLinkable, parseFrontmatter, titleFromName } from '../../config/page.mts'

const slash = (p: string) => p.replace(/\\/g, '/')
const srcDirAbs = slash(process.cwd()).replace(/\/$/, '') + '/source'

interface Crumb {
  text: string
  link?: string
}

/**
 * 面包屑映射：扫描所有 .md，按「物理路径」分级，构建「页面路由 -> 完整面包屑」。
 * 面包屑顺序：顶级栏目 → … → 当前页（末项无链接）。
 */
export default {
  watch: join(process.cwd(), 'source', '**/*.md'),
  async load(files: string[]) {
    const rels = files.map((f) => slash(f).slice(srcDirAbs.length + 1))

    // 物理目录 -> 名称 / 链接（来自 index.md 的 title 与 permalink 路由）
    const dirName: Record<string, string> = {}
    const dirLink: Record<string, string> = {}
    for (let i = 0; i < files.length; i++) {
      const rel = rels[i]
      if (rel === 'index.md' || !rel.endsWith('/index.md')) continue
      const dir = posix.dirname(rel)
      const raw = readFileSync(files[i], 'utf-8')
      const fm = parseFrontmatter(raw)
      dirName[dir] = getDisplayTitle(fm, raw, titleFromName(posix.basename(dir)))
      // index.md 的 frontmatter.linkable 为 false 时该级面包屑不生成链接（标题仍展示、不可点击）
      if (isIndexLinkable(fm)) dirLink[dir] = '/' + getFinalUrl(rel)
    }

    // 每个页面 -> 完整物理面包屑
    const trails: Record<string, Crumb[]> = {}
    for (let i = 0; i < files.length; i++) {
      const rel = rels[i]
      const parts = rel.split('/').filter(Boolean)
      const isIndex = parts[parts.length - 1] === 'index.md'
      const dirParts = parts.slice(0, -1) // 目录段（不含最后的 index.md / 文件名）

      const trail: Crumb[] = []
      // 祖先目录：index 页排除自身所在目录（它就是当前页）
      const ancestorParts = isIndex ? dirParts.slice(0, -1) : dirParts
      for (let s = 0; s < ancestorParts.length; s++) {
        const dir = ancestorParts.slice(0, s + 1).join('/')
        const text = dirName[dir] || titleFromName(ancestorParts[s])
        const link = dirLink[dir]
        trail.push(link ? { text, link } : { text })
      }

      // 当前页：index 页取所在目录名，普通页取标题 > 文件名
      let current: string
      if (isIndex) {
        const dir = dirParts.join('/')
        current = dirName[dir] || titleFromName(dirParts[dirParts.length - 1] || '')
      } else {
        current = getDisplayTitleFromFile(files[i], titleFromName(posix.basename(rel, '.md')))
      }
      trail.push({ text: current })

      // 键：干净路由（去尾斜杠，根为 /）
      const route = '/' + getFinalUrl(rel)
      const key = route === '/' ? '/' : route.replace(/\/$/, '')
      trails[key] = trail
    }

    return { trails }
  },
}
