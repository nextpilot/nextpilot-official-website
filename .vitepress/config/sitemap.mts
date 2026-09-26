import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import type { Plugin } from 'vite'

const SITE_URL = 'https://nextpilot.org'
const BUILD_DIR = 'build'
const SRC_DIR = 'source'

/**
 * 增强 Sitemap 插件：在 VitePress 构建完成后，
 * 1. 为 sitemap.xml 增加 hreflang / priority / changeFrequency
 * 2. 使用源文件的实际修改时间作为 lastmod
 */
export function enhancedSitemapPlugin(): Plugin {
  return {
    name: 'enhanced-sitemap',
    apply: 'build',
    async closeBundle() {
      const sitemapPath = join(process.cwd(), BUILD_DIR, 'sitemap.xml')
      if (!existsSync(sitemapPath)) {
        console.warn('[enhanced-sitemap] sitemap.xml not found, skipping')
        return
      }

      // 构建 URL → 源文件 mtime 的映射表
      const mtimeMap = buildMtimeMap()

      let xml = readFileSync(sitemapPath, 'utf-8')

      // 替换默认的 <url> 条目，增加 hreflang / priority / changeFrequency / lastModified
      xml = xml.replace(/<url>\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>[^<]*<\/lastmod>\s*)?<\/url>/g, (_match, loc: string) => {
        const url = loc.trim()
        const isEnglish = url.includes('/en/')
        const altUrl = isEnglish ? url.replace(`${SITE_URL}/en/`, `${SITE_URL}/`) : url.replace(SITE_URL, `${SITE_URL}/en`)

        // 优先级：首页 > 产品 > 文档 > blog > 关于 > 其他
        let priority = '0.5'
        let changeFreq = 'weekly'
        if (url === SITE_URL + '/' || url === SITE_URL + '/en/') {
          priority = '1.0'
          changeFreq = 'daily'
        } else if (url.includes('/product/')) {
          priority = '0.9'
          changeFreq = 'monthly'
        } else if (url.includes('/docs/')) {
          priority = '0.8'
          changeFreq = 'weekly'
        } else if (url.includes('/blog/')) {
          priority = '0.7'
          changeFreq = 'weekly'
        } else if (url.includes('/about/')) {
          priority = '0.6'
          changeFreq = 'monthly'
        }

        // 获取源文件真实修改时间
        const urlPath = url.replace(SITE_URL, '')
        const mtime = mtimeMap.get(urlPath)
        const lastmod = mtime ? mtime.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

        return `<url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="${isEnglish ? 'en-US' : 'zh-CN'}" href="${url}"/>
    <xhtml:link rel="alternate" hreflang="${isEnglish ? 'zh-CN' : 'en-US'}" href="${altUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${isEnglish ? url.replace(`${SITE_URL}/en/`, `${SITE_URL}/`) : url}"/>
  </url>`
      })

      // 确保 xmlns:xhtml 命名空间存在
      if (!xml.includes('xmlns:xhtml')) {
        xml = xml.replace('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"')
      }

      writeFileSync(sitemapPath, xml)
      console.log('[enhanced-sitemap] Sitemap enhanced with hreflang, priority, changeFrequency, lastModified (from source files)')
    },
  }
}

/** 构建 URL 路径 → 源文件 mtime 的映射（递归扫描 source 目录） */
function buildMtimeMap(): Map<string, Date> {
  const map = new Map<string, Date>()
  const srcRoot = join(process.cwd(), SRC_DIR)
  if (!existsSync(srcRoot)) return map

  function scan(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        scan(full)
      } else if (entry.name.endsWith('.md')) {
        try {
          const stat = statSync(full)
          const rel = relative(srcRoot, full).replace(/\\/g, '/')
          // 映射为 VitePress 输出 URL
          const url = mdToUrl(rel)
          map.set(url, stat.mtime)
        } catch {
          // 忽略无法读取的文件
        }
      }
    }
  }

  scan(srcRoot)
  return map
}

/** 将 source 目录下的 markdown 路径转为输出 URL */
function mdToUrl(rel: string): string {
  if (rel === 'index.md') return '/'
  if (rel.endsWith('/index.md')) return '/' + rel.slice(0, -'index.md'.length)
  return '/' + rel.replace(/\.md$/, '.html')
}
