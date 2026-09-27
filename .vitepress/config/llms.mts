import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

const SITE_URL = 'https://nextpilot.org'
const SRC_DIR = 'source'

interface PageDoc {
  url: string
  title: string
  lastUpdated: string
  body: string
  lang: 'zh' | 'en'
}

/** 读取 md 文件，剥离 frontmatter 并返回字段与正文 */
function readPage(filePath: string): { fm: Record<string, unknown>; body: string } | null {
  try {
    const raw = readFileSync(filePath, 'utf-8')
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
    if (!m) return { fm: {}, body: raw }
    const fm: Record<string, unknown> = {}
    const lines = m[1].split(/\r?\n/)
    let key = ''
    let val: string[] = []
    const flush = () => {
      if (key) {
        fm[key] = val.length > 1 ? val.join(', ') : val[0] || ''
        val = []
      }
    }
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      // 跳过 YAML 注释行（# 开头），避免被误当作上一字段的续行
      if (trimmed.startsWith('#')) continue
      const kv = line.match(/^([\w-]+):\s*(.*)$/)
      if (kv) {
        flush()
        key = kv[1]
        val = [kv[2].trim()]
      } else {
        val.push(trimmed.replace(/^-\s*/, ''))
      }
    }
    flush()
    return { fm, body: m[2] }
  } catch {
    return null
  }
}

/** 从正文取第一个一级标题作为标题兜底 */
function firstH1(body: string): string {
  const line = body.split(/\r?\n/).find((l) => /^#\s+/.test(l.trim()))
  return line ? line.replace(/^#\s+/, '').trim() : ''
}

/** 转 ISO 日期（YYYY-MM-DD），非法返回空串 */
function toISODate(v: unknown): string {
  if (v == null || v === '') return ''
  const d = new Date(String(v))
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

/**
 * GEO（Generative Engine Optimization）产物：构建期生成
 *   - llms-full.txt    ：全站中文页面的 Markdown 原文转储
 *   - llms-full-en.txt ：全站英文页面的 Markdown 原文转储
 * 供 ChatGPT / Claude / Perplexity / Google AI Overviews 等生成式引擎一次性抓取全站内容。
 *
 * URL 计算与 rss-feed 完全一致：复用 siteConfig.pages + rewrites.map，
 * 保证与站点、sitemap 的 URL 一模一样。draft:true 与 404 页面跳过。
 *
 * 执行时机：在 configResolved 捕获 siteConfig 后，链式挂载到其 buildEnd
 * （VitePress 流程中 generateSitemap 之后才调用，此时 outDir 已就绪，时序安全）。
 * 用与 enhanced-sitemap 相同的链式 + 守卫写法，互不覆盖。
 *
 * 策展版导航见 public/llms.txt 与 public/llms-en.txt。
 */
export function llmsFullPlugin(): Plugin {
  return {
    name: 'llms-full',
    apply: 'build',
    configResolved(config) {
      const vp = (config as { vitepress?: any }).vitepress
      if (!vp || vp.__llmsFullInstalled) return
      vp.__llmsFullInstalled = true
      const prevBuildEnd = vp.buildEnd
      vp.buildEnd = async (siteConfig: any) => {
        if (prevBuildEnd) await prevBuildEnd(siteConfig)
        generateLlmsFull(siteConfig)
      }
    },
  }
}

function generateLlmsFull(siteConfig: any) {
  const docs: PageDoc[] = []

  for (const page of siteConfig.pages as string[]) {
    // 与 generateSitemap / rss-feed 一致的「源路径 → 最终 URL」换算
    const rewritten = (siteConfig.rewrites?.map?.[page] as string | undefined) || page
    let urlPath = rewritten.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, siteConfig.cleanUrls ? '' : '.html')
    if (!urlPath.startsWith('/')) urlPath = '/' + urlPath

    // 跳过 404 页面
    if (/\/404$/.test(urlPath) || /404\.html?$/.test(urlPath)) continue

    const srcFile = join(process.cwd(), SRC_DIR, page)
    const parsed = readPage(srcFile)
    if (!parsed) continue
    const fm = parsed.fm

    // 跳过草稿（discovery / news 等占位页）
    if (fm.draft === true) continue
    // 跳过首页（layout: home，纯组件渲染、无 Markdown 正文，dump 出来是空条目）
    if (fm.layout === 'home') continue

    const lang = urlPath.startsWith('/en/') ? 'en' : 'zh'
    const title = fm.title != null && fm.title !== '' ? String(fm.title) : firstH1(parsed.body) || 'Untitled'
    const lastUpdated = toISODate(fm.lastUpdated) || toISODate(fm.date)

    docs.push({
      url: `${SITE_URL}${urlPath}`,
      title,
      lastUpdated,
      body: parsed.body.trim(),
      lang,
    })
  }

  const render = (list: PageDoc[]) =>
    list
      .map((d) => {
        const meta = d.lastUpdated ? `\nLast updated: ${d.lastUpdated}` : ''
        return `# ${d.title}\nSource: ${d.url}${meta}\n\n${d.body}`
      })
      .join('\n\n---\n\n')

  const zh = docs.filter((d) => d.lang === 'zh').sort((a, b) => a.url.localeCompare(b.url))
  const en = docs.filter((d) => d.lang === 'en').sort((a, b) => a.url.localeCompare(b.url))

  const buildDir = siteConfig.outDir as string
  const bannerZh = '# NextPilot 全站文档（中文）\n' + '# 本文件由构建自动生成，包含全部中文页面的 Markdown 原文，供生成式 AI 引擎检索与引用。\n' + '# 结构化导航见 https://nextpilot.org/llms.txt\n'
  const bannerEn = '# NextPilot Documentation (English)\n' + '# Auto-generated at build time; contains the full Markdown source of all English pages for generative AI engines.\n' + '# Curated navigation: https://nextpilot.org/llms-en.txt\n'

  writeFileSync(join(buildDir, 'llms-full.txt'), `${bannerZh}\n---\n\n${render(zh)}`)
  writeFileSync(join(buildDir, 'llms-full-en.txt'), `${bannerEn}\n---\n\n${render(en)}`)
  console.log('[llms-full] Generated /llms-full.txt (%d zh pages), /llms-full-en.txt (%d en pages)', zh.length, en.length)
}
