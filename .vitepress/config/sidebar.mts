import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { DefaultTheme } from 'vitepress'
import { getDisplayTitleFromFile, getFinalUrl, parseFrontmatter, titleFromName } from './page.mts'

type SidebarItem = DefaultTheme.SidebarItem

/** 读取 md 文件的 frontmatter */
function readFrontmatter(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {}
  return parseFrontmatter(readFileSync(filePath, 'utf-8'))
}

/** 提取排序前缀数字，无前缀返回 Infinity（排最后） */
function sortPrefixOf(name: string): number {
  const m = name.match(/^(\d+)-/)
  return m ? Number(m[1]) : Infinity
}

/** frontmatter.order，缺失视为 Infinity（排最后） */
function orderOf(fm: Record<string, string>): number {
  const n = Number(fm.order)
  return Number.isFinite(n) ? n : Infinity
}

/** frontmatter.draft 为 true 的草稿不进入侧边栏（与构建排除保持一致） */
function isDraft(fm: Record<string, string>): boolean {
  return fm.draft === 'true'
}

interface Entry {
  order: number
  prefix: number
  path: string
  item: SidebarItem
}

/** 按 order > 排序前缀 > 完整路径 稳定排序，返回纯 SidebarItem[] */
function sortEntries(entries: Entry[]): SidebarItem[] {
  return entries.sort((a, b) => a.order - b.order || a.prefix - b.prefix || a.path.localeCompare(b.path)).map((e) => e.item)
}

/** 判断目录树内是否包含至少一个 md 条目（排除 index.md），用于跳过 imgs 等纯资源目录 */
function hasDocs(dirPath: string): boolean {
  for (const name of readdirSync(dirPath)) {
    const full = join(dirPath, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (hasDocs(full)) return true
    } else if (name.endsWith('.md') && name !== 'index.md') {
      return true
    }
  }
  return false
}

/**
 * 构建一个分组（子目录）及其下的条目，递归处理更深层子目录。
 * relDir 为该目录相对栏目根目录的路径（如 autopilot/00-基本概念），用于拼接链接。
 */
function buildGroup(section: string, relDir: string, dirPath: string, depth: number): SidebarItem {
  const hasIndex = existsSync(join(dirPath, 'index.md'))

  const children: Entry[] = []
  for (const name of readdirSync(dirPath)) {
    const full = join(dirPath, name)
    const st = statSync(full)

    if (st.isDirectory()) {
      // 跳过不含任何 md 条目的目录（如 imgs 图片目录）
      if (!hasDocs(full)) continue
      const childFm = readFrontmatter(join(full, 'index.md'))
      // 草稿分组不进入侧边栏
      if (isDraft(childFm)) continue
      const childRelDir = `${relDir}/${name}`
      children.push({
        order: orderOf(childFm),
        prefix: sortPrefixOf(name),
        path: name,
        item: buildGroup(section, childRelDir, full, depth + 1),
      })
    } else if (st.isFile() && name.endsWith('.md') && name !== 'index.md') {
      const fm = readFrontmatter(full)
      // 草稿条目不进入侧边栏
      if (isDraft(fm)) continue
      children.push({
        order: orderOf(fm),
        prefix: sortPrefixOf(name),
        path: name,
        item: {
          text: getDisplayTitleFromFile(full, titleFromName(basename(name, '.md'))),
          link: `/${getFinalUrl(`${section}/${relDir}/${name}`)}`,
        },
      })
    }
  }

  const group: SidebarItem = {
    text: getDisplayTitleFromFile(join(dirPath, 'index.md'), titleFromName(basename(dirPath))),
    items: sortEntries(children),
    // 顶层分组展开，嵌套子分组默认折叠
    collapsed: depth > 0,
  }
  if (hasIndex) group.link = `/${getFinalUrl(`${section}/${relDir}/index.md`)}`
  return group
}

/**
 * 生成某栏目（manual / develop / community 等）的侧边栏。
 * 子目录映射为分组（标题取 index.md 的 title，链接指向分组首页），
 * 目录下的 md 映射为条目，均排除 index.md。
 */
export function docsSidebar(srcDir: string, section: string): SidebarItem[] {
  const base = join(process.cwd(), srcDir, section)
  if (!existsSync(base)) return []

  const entries: Entry[] = []
  for (const name of readdirSync(base)) {
    const full = join(base, name)
    const st = statSync(full)

    if (st.isDirectory()) {
      const fm = readFrontmatter(join(full, 'index.md'))
      // 草稿分组不进入侧边栏
      if (isDraft(fm)) continue
      entries.push({
        order: orderOf(fm),
        prefix: sortPrefixOf(name),
        path: name,
        item: buildGroup(section, name, full, 0),
      })
    } else if (st.isFile() && name.endsWith('.md') && name !== 'index.md') {
      const fm = readFrontmatter(full)
      // 草稿条目不进入侧边栏
      if (isDraft(fm)) continue
      entries.push({
        order: orderOf(fm),
        prefix: sortPrefixOf(name),
        path: name,
        item: {
          text: getDisplayTitleFromFile(full, titleFromName(basename(name, '.md'))),
          link: `/${getFinalUrl(`${section}/${name}`)}`,
        },
      })
    }
  }

  return sortEntries(entries)
}

/** 判断目录树内是否包含至少一个 md 文件（含 index.md），用于跳过纯资源目录 */
function hasAnyMd(dirPath: string): boolean {
  for (const name of readdirSync(dirPath)) {
    const full = join(dirPath, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (hasAnyMd(full)) return true
    } else if (name.endsWith('.md')) {
      return true
    }
  }
  return false
}

/**
 * 某栏目需要显示该栏目侧边栏的所有路由前缀：栏目根路由 + 被 permalink 逃逸出栏目根的子目录路由。
 * 例如 `manual/05-测试下` 声明 `permalink: /mytest22`，其页面 URL 在 `/mytest22/` 下，
 * 但物理上仍属于 manual，故要把 `/mytest22/` 也映射到 manual 侧边栏。
 */
export function sectionRoutes(srcDir: string, section: string): string[] {
  const base = join(process.cwd(), srcDir, section)
  if (!existsSync(base)) return []

  const columnRoute = '/' + getFinalUrl(`${section}/index.md`)
  const prefixes = [columnRoute]

  const walk = (dirPath: string, relDir: string) => {
    for (const name of readdirSync(dirPath)) {
      const full = join(dirPath, name)
      if (!statSync(full).isDirectory() || !hasAnyMd(full)) continue
      const childRel = relDir ? `${relDir}/${name}` : name
      const route = '/' + getFinalUrl(`${section}/${childRel}/index.md`)
      // 仍在栏目根路由下的子目录已被栏目根覆盖，只额外注册逃逸出去的路由
      if (!route.startsWith(columnRoute)) prefixes.push(route)
      walk(full, childRel)
    }
  }
  walk(base, '')
  return prefixes
}

/** 构建所有栏目的侧边栏映射（路由前缀 -> 侧边栏项），供 config.mts 的 themeConfig.sidebar 使用 */
export function docsSidebars(srcDir: string, sections: string[]): Record<string, SidebarItem[]> {
  const result: Record<string, SidebarItem[]> = {}
  for (const section of sections) {
    const items = docsSidebar(srcDir, section)
    for (const route of sectionRoutes(srcDir, section)) result[route] = items
  }
  return result
}
