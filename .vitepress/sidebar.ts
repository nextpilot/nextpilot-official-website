import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { DefaultTheme } from 'vitepress'

type SidebarItem = DefaultTheme.SidebarItem

const SRC_DIR = join(process.cwd(), 'source')

/** 读取 md 文件的 frontmatter，返回标量字段映射（无 frontmatter 时返回空对象） */
function readFrontmatter(filePath: string): Record<string, string> {
  const raw = readFileSync(filePath, 'utf-8')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const result: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!m) continue
    let val = m[2].trim()
    if (
      val.length >= 2 &&
      ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'")))
    ) {
      val = val.slice(1, -1)
    }
    result[m[1]] = val
  }
  return result
}

/** 去除文件名/目录名的排序前缀（形如 01-、20240101-） */
function stripSortPrefix(name: string): string {
  return name.replace(/^\d+-/, '')
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

interface Entry {
  order: number
  prefix: number
  path: string
  item: SidebarItem
}

/** 按 order > 排序前缀 > 完整路径 稳定排序，返回纯 SidebarItem[] */
function sortEntries(entries: Entry[]): SidebarItem[] {
  return entries
    .sort(
      (a, b) => a.order - b.order || a.prefix - b.prefix || a.path.localeCompare(b.path)
    )
    .map((e) => e.item)
}

/** 构建一个分组（子目录）及其下的条目 */
function buildGroup(section: string, dir: string, dirPath: string): SidebarItem {
  const indexFm = readFrontmatter(join(dirPath, 'index.md'))
  const hasIndex = existsSync(join(dirPath, 'index.md'))

  const children: Entry[] = []
  for (const name of readdirSync(dirPath)) {
    if (!name.endsWith('.md') || name === 'index.md') continue
    const fm = readFrontmatter(join(dirPath, name))
    children.push({
      order: orderOf(fm),
      prefix: sortPrefixOf(name),
      path: name,
      item: {
        text: fm.title || stripSortPrefix(basename(name, '.md')),
        link: `/${section}/${dir}/${basename(name, '.md')}`,
      },
    })
  }

  const group: SidebarItem = {
    text: indexFm.title || stripSortPrefix(dir),
    items: sortEntries(children),
  }
  if (hasIndex) group.link = `/${section}/${dir}/`
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
      entries.push({
        order: orderOf(readFrontmatter(join(full, 'index.md'))),
        prefix: sortPrefixOf(name),
        path: name,
        item: buildGroup(section, name, full),
      })
    } else if (st.isFile() && name.endsWith('.md') && name !== 'index.md') {
      const fm = readFrontmatter(full)
      entries.push({
        order: orderOf(fm),
        prefix: sortPrefixOf(name),
        path: name,
        item: {
          text: fm.title || stripSortPrefix(basename(name, '.md')),
          link: `/${section}/${basename(name, '.md')}`,
        },
      })
    }
  }

  return sortEntries(entries)
}
