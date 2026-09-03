import { readFileSync } from 'node:fs'
import { join, posix } from 'node:path'
import { resolvePageRoute, stripSegmentPrefix } from '../../config/rewrites.mts'

const slash = (p: string) => p.replace(/\\/g, '/')
const srcDirAbs = slash(process.cwd()).replace(/\/$/, '') + '/source'

interface Crumb {
  text: string
  link?: string
}

/** 解析 md 原始内容的 frontmatter，返回标量字段映射 */
function parseFrontmatter(raw: string): Record<string, string> {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  const result: Record<string, string> = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!kv) continue
    let val = kv[2].trim()
    if (val.length >= 2 && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) {
      val = val.slice(1, -1)
    }
    result[kv[1]] = val
  }
  return result
}

/** 标题：shortTitle > title > 一级标题 */
function resolveTitle(fm: Record<string, string>, raw: string): string {
  if (fm.shortTitle) return fm.shortTitle
  if (fm.title) return fm.title
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const h1 = body.match(/^#\s+(.+)$/m)
  return h1 ? h1[1].trim() : ''
}

/** 段名兜底：去排序前缀、去 .md，转大写（如 np-fcc-h05 → NP-FCC-H05） */
function nameFromSegment(seg: string): string {
  return stripSegmentPrefix(seg.replace(/\.md$/, '')).toUpperCase()
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
      dirName[dir] = resolveTitle(parseFrontmatter(raw), raw) || nameFromSegment(posix.basename(dir))
      dirLink[dir] = '/' + resolvePageRoute(rel)
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
        const text = dirName[dir] || nameFromSegment(ancestorParts[s])
        const link = dirLink[dir]
        trail.push(link ? { text, link } : { text })
      }

      // 当前页：index 页取所在目录名，普通页取标题 > 文件名
      let current: string
      if (isIndex) {
        const dir = dirParts.join('/')
        current = dirName[dir] || nameFromSegment(dirParts[dirParts.length - 1] || '')
      } else {
        const raw = readFileSync(files[i], 'utf-8')
        const fm = parseFrontmatter(raw)
        current = resolveTitle(fm, raw) || nameFromSegment(posix.basename(rel))
      }
      trail.push({ text: current })

      // 键：干净路由（去尾斜杠，根为 /）
      const route = '/' + resolvePageRoute(rel)
      const key = route === '/' ? '/' : route.replace(/\/$/, '')
      trails[key] = trail
    }

    return { trails }
  },
}
