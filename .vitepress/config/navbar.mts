import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { DefaultTheme } from 'vitepress'
import { getDisplayTitleFromFile, getFinalUrl, parseFrontmatter, titleFromName } from './page.mts'

type NavItem = DefaultTheme.NavItem

/** 读取 md 文件的 frontmatter（文件缺失返回空对象） */
function readFrontmatter(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {}
  return parseFrontmatter(readFileSync(filePath, 'utf-8'))
}

/** frontmatter.draft 为 true 的草稿栏目不进入导航 */
function isDraft(filePath: string): boolean {
  return readFrontmatter(filePath).draft === 'true'
}

/** 提取排序前缀数字（xx-），无前缀返回 Infinity（排最后） */
function sortPrefixOf(name: string): number {
  const match = name.match(/^(\d+)-/)
  return match ? Number(match[1]) : Infinity
}

/** index.md 的 frontmatter.order，缺失返回 Infinity（排最后） */
function orderOf(indexPath: string): number {
  const order = Number(readFrontmatter(indexPath).order)
  return Number.isFinite(order) ? order : Infinity
}

/** 目录树内是否包含至少一个 md 文件（用于跳过纯资源目录） */
function hasMarkdown(dirPath: string): boolean {
  return readdirSync(dirPath).some((name) => {
    const fullPath = join(dirPath, name)
    return statSync(fullPath).isDirectory() ? hasMarkdown(fullPath) : name.endsWith('.md')
  })
}

interface ChildEntry {
  order: number
  prefix: number
  name: string
  item: NavItem
}

/**
 * 构建二级菜单条目：顶级栏目的直接子目录（子栏目）与直接 md 页面都算二级条目，
 * 统一按 frontmatter.order > 排序前缀（xx-）> 名称排序；排除 index.md 与草稿。
 */
function childItems(sectionPath: string, section: string): NavItem[] {
  const entries: ChildEntry[] = []

  for (const name of readdirSync(sectionPath)) {
    const fullPath = join(sectionPath, name)

    if (statSync(fullPath).isDirectory()) {
      const indexPath = join(fullPath, 'index.md')
      if (!hasMarkdown(fullPath) || isDraft(indexPath)) continue
      entries.push({
        order: orderOf(indexPath),
        prefix: sortPrefixOf(name),
        name,
        item: {
          text: getDisplayTitleFromFile(indexPath, titleFromName(basename(name))),
          link: `/${getFinalUrl(`${section}/${name}/index.md`)}`,
        },
      })
    } else if (name.endsWith('.md') && name !== 'index.md') {
      if (isDraft(fullPath)) continue
      entries.push({
        order: orderOf(fullPath),
        prefix: sortPrefixOf(name),
        name,
        item: {
          text: getDisplayTitleFromFile(fullPath, titleFromName(basename(name, '.md'))),
          link: `/${getFinalUrl(`${section}/${name}`)}`,
        },
      })
    }
  }

  return entries.sort((a, b) => a.order - b.order || a.prefix - b.prefix || a.name.localeCompare(b.name)).map((entry) => entry.item)
}

/** 构建单个顶级栏目导航项：标题/链接取 index.md（shortTitle > title > 一级标题 > 目录名） */
function sectionItem(srcDir: string, section: string): NavItem | undefined {
  const sectionPath = join(process.cwd(), srcDir, section)
  const indexPath = join(sectionPath, 'index.md')
  if (!existsSync(sectionPath) || !existsSync(indexPath) || isDraft(indexPath)) return undefined

  const sectionTitle = getDisplayTitleFromFile(indexPath, titleFromName(section))
  const sectionLink = `/${getFinalUrl(`${section}/index.md`)}`
  const children = childItems(sectionPath, section)

  // 无二级栏目：顶级项直接作为链接
  if (children.length === 0) return { text: sectionTitle, link: sectionLink }

  // 含二级栏目：VitePress 要求下拉组顶级项不带 link（否则渲染为普通链接），
  // 下拉只列二级栏目，栏目首页（index.md）不放入下拉；
  // sectionLink 为自定义字段，携带栏目首页链接，供主题点击一级菜单时跳转（见 theme/Layout.vue）
  return {
    text: sectionTitle,
    items: children,
    sectionLink,
  } as NavItem
}

/**
 * 根据 source 的顶级栏目与二级子目录自动生成中文站点导航。
 *
 * - 顶级栏目：source 下含 index.md 且非草稿的目录，排序取 index.md 的 `order` >
 *   目录排序前缀（xx-）> 目录名；新增栏目目录并补充 index.md 即自动出现，无需改代码
 * - localeDirs：其它语言站点的目录名（如 `en`），由 config.mts 从 locales 配置派生后传入
 */
export function docsNavbar(srcDir: string, localeDirs: string[] = []): DefaultTheme.NavItem[] {
  const sourcePath = join(process.cwd(), srcDir)
  if (!existsSync(sourcePath)) return []
  const skipped = new Set(localeDirs)

  return readdirSync(sourcePath)
    .filter((name) => {
      if (!statSync(join(sourcePath, name)).isDirectory() || skipped.has(name)) return false
      const indexPath = join(sourcePath, name, 'index.md')
      return existsSync(indexPath) && !isDraft(indexPath)
    })
    .sort((a, b) => orderOf(join(sourcePath, a, 'index.md')) - orderOf(join(sourcePath, b, 'index.md')) || sortPrefixOf(a) - sortPrefixOf(b) || a.localeCompare(b))
    .map((section) => sectionItem(srcDir, section))
    .filter((item): item is NavItem => item !== undefined)
}
