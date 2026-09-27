import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

const SITE_URL = 'https://nextpilot.org'
const BUILD_DIR = 'build'

/**
 * 增强 Sitemap 插件。
 *
 * 原实现在 Vite 的 `closeBundle` 钩子里读取 sitemap.xml 并做增强，但 VitePress 的
 * sitemap 生成（`generateSitemap`）发生在「渲染页面」之后、且早于任何 `closeBundle`，
 * 因此原插件永远读不到 sitemap.xml（日志里一直打印 "sitemap.xml not found, skipping"）。
 *
 * 修复方案：在 `configResolved` 里拿到 VitePress 的 siteConfig，并覆写其 `buildEnd`
 * 钩子——VitePress 的构建流程是
 *   bundle() → render() → generateSitemap() → siteConfig.buildEnd?.(siteConfig)
 * 所以 `buildEnd` 一定在 sitemap.xml 落盘之后才执行，时序上绝对安全。
 *
 * 增强内容（在 VitePress 已生成的 lastmod / hreflang 互链基础上追加，绝不覆盖已有字段）：
 *   - <changefreq> / <priority>：按栏目分级
 *   - <xhtml:link rel="alternate" hreflang="x-default">：指向默认语言（简体中文）版本
 * 整个替换是幂等的，重复执行不会产生重复字段。
 */
export function enhancedSitemapPlugin(): Plugin {
  return {
    name: 'enhanced-sitemap',
    apply: 'build',
    configResolved(config) {
      const vp = (config as { vitepress?: any }).vitepress
      if (!vp || vp.__enhancedSitemapInstalled) return
      vp.__enhancedSitemapInstalled = true
      const prevBuildEnd = vp.buildEnd
      vp.buildEnd = async (siteConfig: any) => {
        if (prevBuildEnd) await prevBuildEnd(siteConfig)
        enhanceSitemap(siteConfig)
      }
    },
  }
}

/** 按 URL 路径计算优先级与更新频率 */
function rank(url: string): { priority: string; changefreq: string } {
  if (url === SITE_URL + '/' || url === SITE_URL + '/en/') {
    return { priority: '1.0', changefreq: 'daily' }
  }
  if (url.includes('/product/')) return { priority: '0.9', changefreq: 'monthly' }
  if (url.includes('/docs/')) return { priority: '0.8', changefreq: 'weekly' }
  if (url.includes('/blog/')) return { priority: '0.7', changefreq: 'weekly' }
  if (url.includes('/about/')) return { priority: '0.6', changefreq: 'monthly' }
  return { priority: '0.5', changefreq: 'weekly' }
}

function enhanceSitemap(siteConfig: any) {
  const sitemapPath = join(siteConfig.outDir || BUILD_DIR, 'sitemap.xml')
  if (!existsSync(sitemapPath)) {
    console.warn('[enhanced-sitemap] sitemap.xml not found, skipping')
    return
  }

  const xml = readFileSync(sitemapPath, 'utf-8')

  const enhanced = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block) => {
    const locMatch = block.match(/<loc>([^<]*)<\/loc>/)
    if (!locMatch) return block
    const url = locMatch[1].trim()

    const lastmodMatch = block.match(/<lastmod>([^<]*)<\/lastmod>/)
    const lastmod = lastmodMatch ? lastmodMatch[1] : null

    // 保留 VitePress 已生成的 hreflang 互链
    const alts = [...block.matchAll(/<xhtml:link[^>]*\/>/g)].map((m) => m[0])
    const hasXDefault = alts.some((a) => a.includes('hreflang="x-default"'))

    const { priority, changefreq } = rank(url)
    // 默认语言为简体中文：x-default 指向去掉 /en/ 前缀的版本
    const xDefaultHref = url.replace(`${SITE_URL}/en/`, `${SITE_URL}/`)

    const lines = ['  <url>']
    lines.push(`    <loc>${url}</loc>`)
    if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`)
    lines.push(`    <changefreq>${changefreq}</changefreq>`)
    lines.push(`    <priority>${priority}</priority>`)
    for (const alt of alts) lines.push(`    ${alt}`)
    if (!hasXDefault) {
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}"/>`)
    }
    lines.push('  </url>')
    return lines.join('\n')
  })

  writeFileSync(sitemapPath, enhanced)
  console.log('[enhanced-sitemap] sitemap enhanced: priority / changefreq / x-default added (hreflang & lastmod preserved)')
}
