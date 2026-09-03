import { readFileSync } from 'node:fs'
import { join, posix } from 'node:path'

// 内容源目录（相对项目根），用于读取 frontmatter 解析 permalink
const srcDir = 'source'

/** 去掉单个段落的前导数字排序前缀（如 `03-quickstart` → `quickstart`、`10-gnss-config` → `gnss-config`） */
export function stripSegmentPrefix(name: string): string {
  return name.replace(/^\d+-/, '')
}

/** 对路径的每个 `/` 分隔段落去掉前缀 */
export function stripPrefixes(path: string): string {
  return path.split('/').map(stripSegmentPrefix).join('/')
}

/** 读取某源文件 frontmatter 里的 permalink（无则返回 null，读取失败返回 null） */
function readPermalink(sourcePath: string): string | null {
  try {
    const raw = readFileSync(join(process.cwd(), srcDir, sourcePath), 'utf-8')
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!m) return null
    const line = m[1].split(/\r?\n/).find((l) => l.trimStart().startsWith('permalink:'))
    if (!line) return null
    const val = line.slice(line.indexOf(':') + 1).trim().replace(/^['"]|['"]$/g, '')
    return val || null
  } catch {
    return null
  }
}

/** 规范化 permalink：去空白、去可选 .md/.html 后缀与尾部斜杠 */
function normalizePermalink(permalink: string): string {
  return permalink.trim().replace(/\.(md|html)$/, '').replace(/\/+$/, '')
}

/** 目录（相对 srcDir、不含尾斜杠）的干净路由：index.md 的 permalink（绝对/相对递归）或去前缀物理路径 */
function resolveDirRoute(dirPath: string): string {
  if (!dirPath || dirPath === '.') return ''
  const permalink = readPermalink(`${dirPath}/index.md`)
  if (permalink) {
    const p = normalizePermalink(permalink)
    if (p.startsWith('/')) return p.slice(1)
    const parent = resolveDirRoute(posix.dirname(dirPath))
    return parent ? posix.join(parent, p) : p
  }
  return stripPrefixes(dirPath)
}

/** 是否 index.md（含根 index） */
function isIndex(sourcePath: string): boolean {
  return sourcePath === 'index.md' || sourcePath.endsWith('/index.md')
}

/** 源文件所在目录（相对 srcDir，根目录返回空串） */
function dirOf(sourcePath: string): string {
  const dir = posix.dirname(sourcePath)
  return dir === '.' ? '' : dir
}

/**
 * 页面最终 URL 路径（相对 srcDir、含 .md）。
 * index.md 的 permalink 定义其所在目录的路由（页面落在 `<目录路由>/index.md`），
 * 普通页面的 permalink 定义自身路由；无 permalink 的子页面自动继承所在目录的 permalink 路由。
 */
export function resolvePageUrl(sourcePath: string): string {
  const dir = dirOf(sourcePath)

  if (isIndex(sourcePath)) {
    const route = resolveDirRoute(dir)
    return route ? `${route}/index.md` : 'index.md'
  }

  const permalink = readPermalink(sourcePath)
  if (permalink) {
    const p = normalizePermalink(permalink)
    if (p.startsWith('/')) return `${p.slice(1)}.md`
    const route = resolveDirRoute(dir)
    return `${route ? posix.join(route, p) : p}.md`
  }

  const route = resolveDirRoute(dir)
  const file = stripSegmentPrefix(posix.basename(sourcePath))
  return route ? `${route}/${file}` : file
}

/** 页面干净路由（相对 srcDir、无扩展名；index.md 结尾为 /，根 index 为空串） */
export function resolvePageRoute(sourcePath: string): string {
  const dir = dirOf(sourcePath)

  if (isIndex(sourcePath)) {
    const route = resolveDirRoute(dir)
    return route ? `${route}/` : ''
  }

  const permalink = readPermalink(sourcePath)
  if (permalink) {
    const p = normalizePermalink(permalink)
    if (p.startsWith('/')) return p.slice(1)
    const route = resolveDirRoute(dir)
    return route ? posix.join(route, p) : p
  }

  const route = resolveDirRoute(dir)
  const file = stripSegmentPrefix(posix.basename(sourcePath, '.md'))
  return route ? `${route}/${file}` : file
}

/** VitePress `rewrites` 函数形式：源路径（含 .md）→ 最终 URL 路径（含 .md） */
export function buildRewrites(id: string): string {
  return resolvePageUrl(id)
}
