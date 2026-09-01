import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { DefaultTheme } from 'vitepress'
import { resolveTitle } from './title.mts'

type SidebarItem = DefaultTheme.SidebarItem

const SRC_DIR = join(process.cwd(), 'source')

/** 解析 md 原始内容的 frontmatter，返回标量字段映射（无 frontmatter 时返回空对象） */
function parseFrontmatter(raw: string): Record<string, string> {
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

/** 读取 md 文件的 frontmatter */
function readFrontmatter(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {}
  return parseFrontmatter(readFileSync(filePath, 'utf-8'))
}

/** 读取展示标题：frontmatter.shortTitle > title > 一级标题，缺失返回空串（由调用方回退文件名/目录名） */
function readTitle(filePath: string): string {
  if (!existsSync(filePath)) return ''
  const raw = readFileSync(filePath, 'utf-8')
  return resolveTitle(parseFrontmatter(raw), raw)
}

/** 文件名/目录名作为兜底标题：去排序前缀并转大写（如 np-fcc-h05 → NP-FCC-H05） */
function titleFromName(name: string): string {
  return name.replace(/^\d+-/, '').toUpperCase()
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
          text: readTitle(full) || titleFromName(basename(name, '.md')),
          link: `/${section}/${relDir}/${basename(name, '.md')}`,
        },
      })
    }
  }

  const group: SidebarItem = {
    text: readTitle(join(dirPath, 'index.md')) || titleFromName(basename(dirPath)),
    items: sortEntries(children),
    // 顶层分组展开，嵌套子分组默认折叠
    collapsed: depth > 0,
  }
  if (hasIndex) group.link = `/${section}/${relDir}/`
  return group
}

/**
 * 生成某栏目（manual / develop / community 等）的侧边栏。
 * 子目录映射为分组（标题取 index.md 的 title，链接指向分组首页），
 * 目录下的 md 映射为条目，均排除 index.md。
 */
export function docsSidebar(section: string): SidebarItem[] {
  const base = join(SRC_DIR, section)
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
          text: readTitle(full) || titleFromName(basename(name, '.md')),
          link: `/${section}/${basename(name, '.md')}`,
        },
      })
    }
  }

  return sortEntries(entries)
}
