import { existsSync, readFileSync } from 'node:fs'
import { join, posix } from 'node:path'
import { slugify as translitSlugify } from 'transliteration'

// 内容源目录（相对项目根），用于读取 frontmatter 解析 permalink
const srcDir = 'source'

/** 各语言内容目录名：root locale（简体中文）物理位于 zh/，对 URL 不可见；en/ 保留在 URL 中 */
const LOCALE_DIRS = ['zh', 'en'] as const
/** 裸路径（不含语言段）的兜底语言目录：navbar/sidebar 扫描 source/zh 后传入的即裸路径 */
const DEFAULT_LOCALE_DIR = 'zh'

/**
 * 把「相对 srcDir 的物理路径」拆成语言段与其余路径：
 * - 首段恰为 zh/en 时识别为语言目录（VitePress rewrites 入参、Breadcrumb loader、正文相对内链）
 * - 否则视为裸路径（navbar/sidebar 与正文绝对内链的入参），按 root 语言 zh 处理。
 * 边界：root 内容中若出现名为 zh/en 的顶级栏目会产生歧义（当前不存在），新增语言时扩展 LOCALE_DIRS。
 */
function splitLocaleId(sourcePath: string): { localeDir: string; rest: string } {
  const slash = sourcePath.indexOf('/')
  const head = slash === -1 ? sourcePath : sourcePath.slice(0, slash)
  if ((LOCALE_DIRS as readonly string[]).includes(head)) {
    return { localeDir: head, rest: slash === -1 ? '' : sourcePath.slice(slash + 1) }
  }
  return { localeDir: DEFAULT_LOCALE_DIR, rest: sourcePath }
}

// ==================== 路径工具 ====================

/** 去掉单个段落的前导数字排序前缀（如 `03-quickstart` → `quickstart`） */
export function stripSegmentPrefix(name: string): string {
  return name.replace(/^\d+-/, '')
}

/** 对路径的每个 `/` 分隔段落去掉前缀 */
function stripPrefixes(path: string): string {
  return path.split('/').map(stripSegmentPrefix).join('/')
}

// ==================== permalink 解析（内部） ====================

/** 读取某源文件 frontmatter 里的 permalink（无则返回 null，读取失败返回 null） */
function readPermalink(sourcePath: string): string | null {
  try {
    const raw = readFileSync(join(process.cwd(), srcDir, sourcePath), 'utf-8')
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!m) return null
    const line = m[1].split(/\r?\n/).find((l) => l.trimStart().startsWith('permalink:'))
    if (!line) return null
    const val = line
      .slice(line.indexOf(':') + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
    return val || null
  } catch {
    return null
  }
}

/** 规范化 permalink：去空白、去可选 .md/.html 后缀与尾部斜杠 */
function normalizePermalink(permalink: string): string {
  return permalink
    .trim()
    .replace(/\.(md|html)$/, '')
    .replace(/\/+$/, '')
}

/**
 * 目录的干净路由：index.md 的 permalink（绝对/相对递归）或去前缀物理路径。
 * dirRest 为去掉语言段后的目录路径，localeDir 为语言目录名（zh/en），磁盘读取需拼回语言段。
 */
function resolveDirRoute(dirRest: string, localeDir: string): string {
  if (!dirRest || dirRest === '.') return ''
  const permalink = readPermalink(`${localeDir}/${dirRest}/index.md`)
  if (permalink) {
    const p = normalizePermalink(permalink)
    if (p.startsWith('/')) return p.slice(1)
    const parent = resolveDirRoute(posix.dirname(dirRest), localeDir)
    return parent ? posix.join(parent, p) : p
  }
  return stripPrefixes(dirRest)
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

// ==================== url / link ====================

/** 单个语言内的最终 link（干净路由，无扩展名；index.md 结尾为 `/`，语言根 index 为空串，不含语言段） */
function finalUrlForRest(rest: string, localeDir: string): string {
  const dir = dirOf(rest)

  if (isIndex(rest)) {
    const route = resolveDirRoute(dir, localeDir)
    return route ? `${route}/` : ''
  }

  const permalink = readPermalink(`${localeDir}/${rest}`)
  if (permalink) {
    const p = normalizePermalink(permalink)
    if (p.startsWith('/')) return p.slice(1)
    const route = resolveDirRoute(dir, localeDir)
    return route ? posix.join(route, p) : p
  }

  const route = resolveDirRoute(dir, localeDir)
  const file = stripSegmentPrefix(posix.basename(rest, '.md'))
  return route ? `${route}/${file}` : file
}

/**
 * 页面的最终 link（干净路由，无扩展名；index.md 结尾为 `/`，根 index 为空串）。
 * zh 页面的 URL 不带语言段；en 页面统一补 `en/` 前缀（语言由最终 URL 判定，见 config/locales.mts）。
 * 入参既可是带语言段的物理路径（zh/manual/foo.md），也可是裸路径（manual/foo.md，按 zh 处理）。
 */
export function getFinalUrl(sourcePath: string): string {
  const { localeDir, rest } = splitLocaleId(sourcePath)
  const route = finalUrlForRest(rest, localeDir)
  return localeDir === 'en' ? (route ? `en/${route}` : 'en/') : route
}

/** 页面文件路径（相对 srcDir、含 .md），供 VitePress rewrites 与正文内链使用。由 getFinalUrl 派生 */
export function getFileUrl(sourcePath: string): string {
  const { rest } = splitLocaleId(sourcePath)
  if (isIndex(rest)) {
    const route = getFinalUrl(sourcePath)
    return route ? `${route}index.md` : 'index.md'
  }
  return getFinalUrl(sourcePath) + '.md'
}

/**
 * VitePress `rewrites` 函数形式：源路径（含 .md、相对 srcDir）→ 重写后文件路径（含 .md）。
 * zh 页面剥掉语言段并应用 permalink/去前缀；en 页面恒等（en/foo.md → en/foo.md，
 * 与入参相同的恒等映射 VitePress 不会登记，直接按物理路径产出 /en/...）。
 */
export function buildRewrites(id: string): string {
  return getFileUrl(id)
}

// ==================== frontmatter / title ====================

/** 解析 md 原始内容的 frontmatter，返回标量字段映射（无 frontmatter 时返回空对象） */
export function parseFrontmatter(raw: string): Record<string, string> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const result: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!m) continue
    let val = m[2].trim()
    if (val.length >= 2 && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) {
      val = val.slice(1, -1)
    }
    result[m[1]] = val
  }
  return result
}

/** 文件名/目录名作为兜底标题：去排序前缀并转大写（如 np-fcc-h05 → NP-FCC-H05） */
export function titleFromName(name: string): string {
  return stripSegmentPrefix(name).toUpperCase()
}

/** 页面的显示标题：frontmatter.shortTitle > title > 一级标题，缺失时回退 fallbackName */
export function getDisplayTitle(fm: { title?: string; shortTitle?: string } | undefined, content: string, fallbackName = ''): string {
  if (fm?.shortTitle) return fm.shortTitle
  if (fm?.title) return fm.title
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const m = body.match(/^#\s+(.+)$/m)
  if (m) return m[1].trim()
  return fallbackName
}

/** 从文件读取显示标题（读文件 + 解析 frontmatter + getDisplayTitle），文件缺失或无标题回退 fallbackName */
export function getDisplayTitleFromFile(filePath: string, fallbackName = ''): string {
  if (!existsSync(filePath)) return fallbackName
  const raw = readFileSync(filePath, 'utf-8')
  return getDisplayTitle(parseFrontmatter(raw), raw, fallbackName)
}

/**
 * 栏目/子栏目首页（index.md）是否「可链接」：即在导航、侧边栏、面包屑中自动生成可点击链接。
 * frontmatter.linkable 显式写为 `false` 时不可链接（不生成链接，标题仍展示、仅不可点击）；
 * 缺省或写为 `true` 时默认可链接（生成链接）。
 * 注意：仅控制自动导航链接，页面本身仍会构建，仍可通过 URL 或正文内链访问；URL 由 permalink 决定。
 */
export function isIndexLinkable(fm: Record<string, string> | undefined | null): boolean {
  return fm?.linkable !== 'false'
}

// ==================== 分类 / 标签 ====================

/** 兜底分类名（页面未写 `frontmatter.category` 且无栏目时使用），借鉴 Hexo 的 default_category */
export const DEFAULT_CATEGORY = 'uncategorized'

/**
 * 分类名 → slug 的全局映射（借鉴 Hexo `category_map`）：只改 slug、不改名称，键为分类名、大小写敏感。
 * 例：`教程: 'tutorial'` 让分类「教程」的 slug 变成 `tutorial` 而非自动转译的 `jiao-cheng`。
 */
export const categoryMap: Record<string, string> = {}

/** 标签名 → slug 的全局映射（借鉴 Hexo `tag_map`）。 */
export const tagMap: Record<string, string> = {}

/** 名称 → URL 安全 slug（转译非 ASCII + 小写 + 分隔符） */
function slugify(name: string): string {
  return translitSlugify(name, { separator: '-', lowercase: true })
}

/** 页面的分类名（真相源）：`frontmatter.category` > 栏目名 > `uncategorized` */
export function getCategoryName(frontmatterCategory: string | undefined, columnName: string | undefined): string {
  return frontmatterCategory || columnName || DEFAULT_CATEGORY
}

/** 分类名 → 分类 slug：先查 categoryMap，否则 slugify */
export function getCategorySlug(name: string): string {
  return categoryMap[name] || slugify(name)
}

/** 标签名 → 标签 slug：先查 tagMap，否则 slugify */
export function getTagSlug(name: string): string {
  return tagMap[name] || slugify(name)
}
