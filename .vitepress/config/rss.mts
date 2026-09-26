import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import type { Plugin } from 'vite'

const SITE_URL = 'https://nextpilot.org'
const SITE_NAME = 'NextPilot'
const SRC_DIR = 'source'
const BUILD_DIR = 'build'

interface BlogPost {
  url: string
  title: string
  description: string
  date: Date
  tags: string[]
}

/** 从 markdown 文件的 YAML frontmatter 中提取字段和正文 */
function parseMd(filePath: string): { frontmatter: Record<string, unknown>; body: string } | null {
  try {
    const raw = readFileSync(filePath, 'utf-8')
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
    if (!m) return null

    const fm: Record<string, unknown> = {}
    const lines = m[1].split(/\r?\n/)
    let currentKey = ''
    let currentVal: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const kv = line.match(/^(\w[\w-]*\w|\w):\s*(.*)$/)
      if (kv) {
        if (currentKey) {
          fm[currentKey] = currentVal.length > 1 ? currentVal.join(', ') : currentVal[0] || ''
          currentVal = []
        }
        currentKey = kv[1]
        currentVal = [kv[2].trim()]
      } else {
        // 续行或列表项
        currentVal.push(trimmed.replace(/^-\s*/, ''))
      }
    }
    if (currentKey) {
      fm[currentKey] = currentVal.length > 1 ? currentVal.join(', ') : currentVal[0] || ''
    }

    return { frontmatter: fm, body: m[2].trim() }
  } catch {
    return null
  }
}

/** 生成博客文章的 URL 路径 */
function makeUrl(filePath: string): string {
  const rel = relative(join(process.cwd(), SRC_DIR), filePath).replace(/\\/g, '/')
  if (rel === 'index.md') return '/'
  if (rel.endsWith('/index.md')) return '/' + rel.slice(0, -'index.md'.length)
  return '/' + rel.replace(/\.md$/, '.html')
}

// 排除的 layout 类型（非文章页）
const NON_BLOG_LAYOUTS = new Set(['home', 'catalog', 'blog', 'solution', 'product'])

/**
 * RSS Feed 插件：构建后扫描 source 目录，收集博客文章并生成 Atom 1.0 feed。
 * 分别生成 /feed.xml（仅中文）和 /en/feed.xml（仅英文），
 * 同时在根目录生成 /feed.xml 汇总两语言最新 20 篇。
 */
export function rssFeedPlugin(): Plugin {
  return {
    name: 'rss-feed',
    apply: 'build',
    async closeBundle() {
      const srcRoot = join(process.cwd(), SRC_DIR)
      if (!existsSync(srcRoot)) return

      const allPosts: BlogPost[] = []

      // 递归扫描 markdown 文件
      function scan(dir: string) {
        const entries = readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const full = join(dir, entry.name)
          if (entry.isDirectory()) {
            scan(full)
          } else if (entry.name.endsWith('.md')) {
            const parsed = parseMd(full)
            if (!parsed) return
            const fm = parsed.frontmatter
            // 跳过非博客文章页
            if (NON_BLOG_LAYOUTS.has(String(fm.layout || ''))) return
            if (fm.draft === true) return
            // 必须属于 blog 子树
            const url = makeUrl(full)
            if (!/^(\/en)?\/blog\//.test(url)) return
            // 必须有日期
            const dateStr = fm.date ? String(fm.date) : ''
            const date = dateStr ? new Date(dateStr) : new Date(0)
            if (isNaN(date.getTime()) || date.getTime() === 0) return

            const tags = fm.tags ? (Array.isArray(fm.tags) ? fm.tags : [fm.tags]).map(String) : []

            allPosts.push({
              url: `${SITE_URL}${url}`,
              title: String(fm.title || 'Untitled'),
              description: String(fm.description || fm.summary || ''),
              date,
              tags,
            })
          }
        }
      }

      scan(srcRoot)

      if (allPosts.length === 0) {
        console.warn('[rss-feed] No blog posts found')
        return
      }

      // 按日期倒序排序
      allPosts.sort((a, b) => b.date.getTime() - a.date.getTime())

      // 按语言分组
      const zhPosts = allPosts.filter((p) => !p.url.includes('/en/'))
      const enPosts = allPosts.filter((p) => p.url.includes('/en/'))

      const buildDir = join(process.cwd(), BUILD_DIR)

      function generateFeed(posts: BlogPost[], title: string, selfUrl: string): string {
        const updated = posts.length > 0 ? posts[0].date.toISOString() : new Date().toISOString()

        let entries = ''
        for (const post of posts.slice(0, 50)) {
          entries += `
    <entry>
      <title><![CDATA[${post.title}]]></title>
      <link href="${post.url}"/>
      <id>${post.url}</id>
      <published>${post.date.toISOString()}</published>
      <updated>${post.date.toISOString()}</updated>
      <summary type="html"><![CDATA[${post.description}]]></summary>
      ${post.tags.map((t) => `      <category term="${t}"/>`).join('\n')}
    </entry>`
        }

        return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${selfUrl.includes('/en/') ? 'en-US' : 'zh-CN'}">
  <id>${SITE_URL}/</id>
  <title>${title}</title>
  <updated>${updated}</updated>
  <link rel="self" href="${selfUrl}"/>
  <link rel="alternate" href="${SITE_URL}"/>
  <generator>NextPilot</generator>
  <rights>Copyright ${new Date().getFullYear()} ${SITE_NAME}</rights>${entries}
</feed>`
      }

      // 生成各语言 feed
      if (zhPosts.length > 0) {
        const feedXml = generateFeed(zhPosts, `${SITE_NAME} Blog (中文)`, `${SITE_URL}/feed.xml`)
        writeFileSync(join(buildDir, 'feed.xml'), feedXml)
        console.log('[rss-feed] Generated /feed.xml (zh: %d posts)', zhPosts.length)
      }

      if (enPosts.length > 0) {
        const feedXml = generateFeed(enPosts, `${SITE_NAME} Blog (English)`, `${SITE_URL}/en/feed.xml`)
        const enDir = join(buildDir, 'en')
        if (!existsSync(enDir)) {
          mkdirSync(enDir, { recursive: true })
        }
        writeFileSync(join(enDir, 'feed.xml'), feedXml)
        console.log('[rss-feed] Generated /en/feed.xml (en: %d posts)', enPosts.length)
      }

      // 汇总 feed（两语言各取最新 10 篇）
      const merged = [...zhPosts.slice(0, 10), ...enPosts.slice(0, 10)].sort((a, b) => b.date.getTime() - a.date.getTime())

      if (merged.length > 0) {
        const mergedXml = generateFeed(merged, `${SITE_NAME} Blog`, `${SITE_URL}/feed.xml`)
        writeFileSync(join(buildDir, 'feed.xml'), mergedXml)
        console.log('[rss-feed] Generated /feed.xml (merged: %d posts)', merged.length)
      }
    },
  }
}
