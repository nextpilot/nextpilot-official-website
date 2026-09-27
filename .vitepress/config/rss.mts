import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

const SITE_URL = 'https://nextpilot.org'
const SITE_NAME = 'NextPilot'
const SRC_DIR = 'source'

interface BlogPost {
  url: string
  title: string
  description: string
  date: Date
  tags: string[]
  lang: 'zh-CN' | 'en-US'
}

/** 从 markdown 文件的 YAML frontmatter 中提取字段和正文（仅解析本插件需要的字段） */
function parseMd(filePath: string): { frontmatter: Record<string, unknown> } | null {
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

    return { frontmatter: fm }
  } catch {
    return null
  }
}

// 排除的 layout 类型（非文章页：首页 / 列表页 / 产品页 / 解决方案页等）
const NON_BLOG_LAYOUTS = new Set(['home', 'catalog', 'blog', 'solution', 'product'])

/** 解析行内 YAML 列表 `[a, b, c]` → ['a', 'b', 'c']；非列表原样返回为单元素数组 */
function parseInlineList(raw: unknown): string[] {
  const s = String(raw ?? '').trim()
  if (s.startsWith('[') && s.endsWith(']')) {
    return s
      .slice(1, -1)
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
  }
  return s ? [s] : []
}

/**
 * RSS / Atom Feed 插件（Atom 1.0）。
 *
 * 原实现用自写的 `scan()` 递归扫 source 目录、并用物理路径拼 URL，导致两个 bug：
 *   1. 物理路径带 `zh/` 前缀（如 `/zh/blog/...`），而站点经 rewrites 重写后真实 URL
 *      是 `/blog/...`，于是正则 `/^(\/en)?\/blog\//` 把中文博客文章全部排除，feed 为空。
 *   2. 生成的 URL 与线上实际地址不一致，即使命中也是错误链接。
 *
 * 修复方案：直接复用 VitePress 的 siteConfig —— `pages`（源相对路径）+ `rewrites.map`
 * （源路径 → 重写后路径），用与 VitePress `generateSitemap` 完全一致的规则把路径转成
 * 最终 URL，保证 feed 里的链接与站点、sitemap 完全一致。
 *
 * 分别生成 /feed.xml（汇总两语言最新 10 篇）、/en/feed.xml（仅英文）、
 * 以及中文 feed（/feed.xml 先写 zh 再被 merged 覆盖）。
 */
export function rssFeedPlugin(): Plugin {
  let siteConfig: any = null
  return {
    name: 'rss-feed',
    apply: 'build',
    configResolved(config) {
      siteConfig = (config as { vitepress?: any }).vitepress
    },
    async closeBundle() {
      if (!siteConfig) {
        console.warn('[rss-feed] siteConfig unavailable, skipping')
        return
      }

      const allPosts: BlogPost[] = []

      for (const page of siteConfig.pages as string[]) {
        // 用 VitePress 的重写映射得到最终页面路径（去掉排序前缀、zh 根语言去前缀）
        const rewritten = (siteConfig.rewrites?.map?.[page] as string | undefined) || page

        // 与 VitePress generateSitemap 一致的 URL 规则
        let urlPath = rewritten.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, siteConfig.cleanUrls ? '' : '.html')
        if (!urlPath.startsWith('/')) urlPath = '/' + urlPath

        // 仅收集 blog 子树的文章（中文 /blog/... 与英文 /en/blog/...）
        if (!/^\/(en\/)?blog\//.test(urlPath)) continue

        const srcFile = join(process.cwd(), SRC_DIR, page)
        if (!existsSync(srcFile)) continue
        const parsed = parseMd(srcFile)
        if (!parsed) continue
        const fm = parsed.frontmatter

        // 跳过列表页 / 产品页等非文章 layout，以及草稿
        if (NON_BLOG_LAYOUTS.has(String(fm.layout || ''))) continue
        if (fm.draft === true) continue

        // 必须有有效日期
        const dateStr = fm.date ? String(fm.date) : ''
        const date = dateStr ? new Date(dateStr) : new Date(0)
        if (isNaN(date.getTime()) || date.getTime() === 0) continue

        const tags = parseInlineList(fm.tags)

        allPosts.push({
          url: `${SITE_URL}${urlPath}`,
          title: String(fm.title || 'Untitled'),
          description: String(fm.description || fm.summary || ''),
          date,
          tags,
          lang: urlPath.startsWith('/en/') ? 'en-US' : 'zh-CN',
        })
      }

      if (allPosts.length === 0) {
        console.warn('[rss-feed] No blog posts found')
        return
      }

      // 按日期倒序排序
      allPosts.sort((a, b) => b.date.getTime() - a.date.getTime())

      const zhPosts = allPosts.filter((p) => p.lang === 'zh-CN')
      const enPosts = allPosts.filter((p) => p.lang === 'en-US')

      const buildDir = siteConfig.outDir as string

      function generateFeed(posts: BlogPost[], title: string, selfUrl: string, lang: string): string {
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
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${lang}">
  <id>${SITE_URL}/</id>
  <title>${title}</title>
  <updated>${updated}</updated>
  <link rel="self" href="${selfUrl}"/>
  <link rel="alternate" href="${SITE_URL}"/>
  <generator>NextPilot</generator>
  <rights>Copyright ${new Date().getFullYear()} ${SITE_NAME}</rights>${entries}
</feed>`
      }

      // 中文 feed
      if (zhPosts.length > 0) {
        const feedXml = generateFeed(zhPosts, `${SITE_NAME} Blog (中文)`, `${SITE_URL}/feed.xml`, 'zh-CN')
        writeFileSync(join(buildDir, 'feed.xml'), feedXml)
        console.log('[rss-feed] Generated /feed.xml (zh: %d posts)', zhPosts.length)
      }

      // 英文 feed
      if (enPosts.length > 0) {
        const feedXml = generateFeed(enPosts, `${SITE_NAME} Blog (English)`, `${SITE_URL}/en/feed.xml`, 'en-US')
        const enDir = join(buildDir, 'en')
        if (!existsSync(enDir)) mkdirSync(enDir, { recursive: true })
        writeFileSync(join(enDir, 'feed.xml'), feedXml)
        console.log('[rss-feed] Generated /en/feed.xml (en: %d posts)', enPosts.length)
      }

      // 汇总 feed（两语言各取最新 10 篇），覆盖根 /feed.xml
      const merged = [...zhPosts.slice(0, 10), ...enPosts.slice(0, 10)].sort((a, b) => b.date.getTime() - a.date.getTime())
      if (merged.length > 0) {
        const mergedXml = generateFeed(merged, `${SITE_NAME} Blog`, `${SITE_URL}/feed.xml`, 'zh-CN')
        writeFileSync(join(buildDir, 'feed.xml'), mergedXml)
        console.log('[rss-feed] Generated /feed.xml (merged: %d posts)', merged.length)
      }
    },
  }
}
