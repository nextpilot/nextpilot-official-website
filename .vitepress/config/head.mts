import type { HeadConfig, TransformContext } from 'vitepress'

// 站点权威域名，固定为 nextpilot.org（不再依赖 SITE_HOST 环境变量），
// canonical 与 sitemap 始终指向该域名。
const SITE_HOST = 'nextpilot.org'

// 完整站点 URL
export const SITE_URL = `https://${SITE_HOST}`

// ---- SEO 常量 ----

/** 站点全局名称 */
const SITE_NAME = 'NextPilot'

/** 标题后缀模板（VitePress 默认即 `{pageTitle} | {siteTitle}`，此处显式声明用于 OG 等） */
const TITLE_SUFFIX = ` | ${SITE_NAME}`

/** 中文（root）站点描述 */
const ZH_DESC = 'NextPilot 是国产开源先进自动驾驶仪，基于 RT-Thread 与 PX4，支持多旋翼、固定翼与垂起复合翼，面向教育、研究与工业等领域。'

/** 英文站点描述 */
const EN_DESC = 'NextPilot is an open-source advanced autopilot developed in China, built on RT-Thread and PX4, supporting multirotor, fixed-wing and VTOL aircraft for education, research and industry.'

/** 默认 OG 图片（1200×630 的 logo 品牌图，放置在 public/ 根目录） */
const OG_IMAGE_DEFAULT = `${SITE_URL}/logo.png`

/** OG 图片尺寸 */
const OG_IMAGE_WIDTH = 1200
const OG_IMAGE_HEIGHT = 630

/** 站点社交链接（JSON-LD Organization sameAs） */
const SAME_AS = ['https://github.com/nextpilot', 'https://gitee.com/nextpilot', 'https://www.zhihu.com/people/nextpilot', 'https://space.bilibili.com/1327597550']

/** 站点发布者信息 */
const PUBLISHER_NAME = 'NextPilot Development Team'

// 是否启用客户端域名归一跳转：仅当构建环境设置 USE_URL_REDIRECT=1（或 true）时才注入跳转脚本。
// 本地开发与预览部署应保持关闭，避免访问时被跳转到线上域名。
const USE_URL_REDIRECT = process.env.USE_URL_REDIRECT === '1' || process.env.USE_URL_REDIRECT === 'true'

// ---- 路径工具 ----

/** 源文件路径（相对 srcDir，如 index.md / docs/01-manual/index.md / docs/manual/foo.md）→ 权威 URL */
function canonicalPath(page: string): string | null {
  if (page === '404.md') return null
  if (page === 'index.md') return '/'
  if (page.endsWith('/index.md')) return '/' + page.slice(0, -'index.md'.length)
  return '/' + page.replace(/\.md$/, '.html')
}

// ---- 客户端脚本 ----

// 客户端域名归一脚本（仅当 USE_URL_REDIRECT 开启时注入）
const redirectScript: HeadConfig = [
  'script',
  {},
  `(function () {
    var host = location.hostname
    if (host === '${SITE_HOST}') return
    if (host.startsWith('docs.')) {
      var path = location.pathname === '/' ? '/docs/manual/' : '/docs/manual' + location.pathname
      location.replace('${SITE_URL}' + path + location.search)
      return
    }
    location.replace('${SITE_URL}' + location.pathname + location.search)
  })()`,
]

export const redirectHead: HeadConfig[] = USE_URL_REDIRECT ? [redirectScript] : []

// 旧文档路径客户端兜底跳转（始终注入）：manual 与 opensource 栏目已合并到 /docs，
// 边缘中间件未覆盖的托管环境（或整页打开旧链接落到 404 页）时由本脚本接管。
// USE_URL_REDIRECT 开启时非权威域名的归一交给 redirectScript，此处只处理权威域名，避免两边抢跳转。
const legacyGuard = USE_URL_REDIRECT ? `if (location.hostname !== '${SITE_HOST}') return` : ''
const legacyDocsScript: HeadConfig = [
  'script',
  {},
  `(function () {
    ${legacyGuard}
    var p = location.pathname
    var target = null
    if (p === '/manual' || p === '/manual/') {
      target = '/docs/manual/'
    } else if (p.indexOf('/manual/') === 0) {
      target = '/docs/manual/' + p.slice('/manual/'.length)
    } else if (p === '/opensource' || p === '/opensource/') {
      target = '/docs/'
    } else {
      var subs = ['guide', 'develop', 'community']
      for (var i = 0; i < subs.length; i++) {
        var pre = '/opensource/' + subs[i]
        if (p === pre || p === pre + '/') { target = '/docs/' + subs[i] + '/'; break }
        if (p.indexOf(pre + '/') === 0) { target = '/docs/' + subs[i] + '/' + p.slice(pre.length + 1); break }
      }
    }
    if (target) location.replace(target + location.search + location.hash)
  })()`,
]

export const legacyDocsHead: HeadConfig[] = [legacyDocsScript]

// 百度统计站点 ID（token，来自百度统计后台「代码获取」）
const BAIDU_TONGJI_ID = 'e420040ee09f65a191badecde7e2629d'

// 百度统计脚本：异步加载，不阻塞页面渲染
const baiduAnalyticsScript: HeadConfig = [
  'script',
  {},
  `var _hmt = _hmt || []
;(function () {
  var hm = document.createElement('script')
  hm.src = 'https://hm.baidu.com/hm.js?${BAIDU_TONGJI_ID}'
  var s = document.getElementsByTagName('script')[0]
  s.parentNode.insertBefore(hm, s)
})()`,
]

export const baiduAnalyticsHead: HeadConfig[] = [baiduAnalyticsScript]

// ---- 辅助工具 ----

/** 判断当前页是否为英文（ctx.page 输出路径以 en/ 开头） */
function isEnglish(ctx: TransformContext): boolean {
  return ctx.page.startsWith('en/')
}

/** 获取当前页的 locale（zh-CN / en-US） */
function getLocale(ctx: TransformContext): string {
  return isEnglish(ctx) ? 'en-US' : 'zh-CN'
}

/** 获取当前页的备选 locale（中 → 英，英 → 中） */
function getAltLocale(ctx: TransformContext): string {
  return isEnglish(ctx) ? 'zh-CN' : 'en-US'
}

/** 获取当前页的纯页面标题（不带站点后缀，优先 pageData.title，回退 ctx.title） */
function getPageTitle(ctx: TransformContext): string {
  return ctx.pageData.title || ctx.title || SITE_NAME
}

/** 获取当前页的完整标题（页面标题 + 站点后缀），首页不加后缀 */
function getFullTitle(ctx: TransformContext): string {
  const t = getPageTitle(ctx)
  const path = canonicalPath(ctx.page)
  if (path === '/') return SITE_NAME
  return t + TITLE_SUFFIX
}

/** 获取当前页的描述（优先 pageData.description，回退站点默认） */
function getDescription(ctx: TransformContext): string {
  const desc = ctx.pageData.description || ctx.description
  if (desc && desc.trim()) return desc.trim()
  return isEnglish(ctx) ? EN_DESC : ZH_DESC
}

/** 获取当前页的完整 URL */
function getPageUrl(ctx: TransformContext): string {
  const path = canonicalPath(ctx.page)
  if (!path) return SITE_URL
  return `${SITE_URL}${path}`
}

/** 获取当前页的备选语言 URL */
function getAltUrl(ctx: TransformContext): string {
  const path = canonicalPath(ctx.page)
  if (!path) return SITE_URL
  if (isEnglish(ctx)) {
    const zhPath = path.replace(/^\/en\//, '/')
    return `${SITE_URL}${zhPath}`
  }
  return `${SITE_URL}/en${path === '/' ? '/' : path}`
}

/** 获取当前页的 OG 图片 URL（优先 frontmatter.ogImage / frontmatter.image，回退默认） */
function getOgImage(ctx: TransformContext): string {
  const custom = fm(ctx).ogImage || fm(ctx).image
  if (custom && typeof custom === 'string') {
    return custom.startsWith('http') ? custom : `${SITE_URL}${custom.startsWith('/') ? '' : '/'}${custom}`
  }
  return OG_IMAGE_DEFAULT
}

/** 转为 ISO 8601 日期字符串 */
function toISODate(d: unknown): string | null {
  if (!d) return null
  if (d instanceof Date) return Number.isNaN(d.getTime()) ? null : d.toISOString()
  const s = String(d)
  const m = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (m) {
    const iso = new Date(`${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`).toISOString()
    return Number.isNaN(Date.parse(iso)) ? null : iso
  }
  const ts = Date.parse(s)
  return Number.isNaN(ts) ? null : new Date(ts).toISOString()
}

/** 安全访问 pageData 上的自定义 frontmatter 字段（pageData 类型定义不包含自定义字段） */
 
function fm(ctx: TransformContext): Record<string, any> {
  const pd = ctx.pageData as unknown as Record<string, any>
  return pd.frontmatter || pd
}

/** 从 OG 图片 URL 推测 MIME type */
function getOgImageType(url: string): string {
  if (url.endsWith('.png')) return 'image/png'
  if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg'
  if (url.endsWith('.webp')) return 'image/webp'
  if (url.endsWith('.gif')) return 'image/gif'
  return 'image/png'
}

/** 判断当前页是否属于 blog 栏目（按输出路径） */
function isBlogPage(ctx: TransformContext): boolean {
  const path = canonicalPath(ctx.page)
  return path !== null && /^(\/en)?\/blog\//.test(path)
}

/** 判断当前页是否为产品详情页（/product/ 下的 .html 非 index 页） */
function isProductPage(ctx: TransformContext): boolean {
  const path = canonicalPath(ctx.page)
  if (!path) return false
  return /^(\/en)?\/product\/.+\/.+\.html$/.test(path)
}

/** 判断当前页是否为软件/下载相关页（用于 SoftwareApplication JSON-LD） */
function isSoftwarePage(ctx: TransformContext): boolean {
  const path = canonicalPath(ctx.page)
  if (!path) return false
  return /^(\/en)?\/(download|software)/.test(path)
}

/** 判断当前页是否包含 FAQ 内容（按 frontmatter.faq 或 frontmatter.layout === 'faq'） */
function isFAQPage(ctx: TransformContext): boolean {
  return fm(ctx).faq === true || fm(ctx).layout === 'faq'
}

/** 判断当前页是否需要禁止索引（/me 和 /analyze/[id] 页面） */
function isNoIndexPage(ctx: TransformContext): boolean {
  const path = canonicalPath(ctx.page)
  if (!path) return true
  return /^(\/en)?\/(me|analyze\/)/.test(path)
}

// ---- Item 6: Robots Meta ----

/** 生成 robots meta 标签 */
function robotsMeta(ctx: TransformContext): HeadConfig | null {
  if (isNoIndexPage(ctx)) {
    return ['meta', { name: 'robots', content: 'noindex, nofollow' }]
  }
  return ['meta', { name: 'robots', content: 'index, follow' }]
}

// ---- Item 3 & 4 & 5: OpenGraph / Twitter Card / hreflang ----

/** 生成每页的 OpenGraph 与 Twitter Card meta（含 hreflang 双向 + x-default） */
function ogTwitterMeta(ctx: TransformContext): HeadConfig[] {
  const url = getPageUrl(ctx)
  const title = getFullTitle(ctx)
  const desc = getDescription(ctx)
  const locale = getLocale(ctx)
  const altLocale = getAltLocale(ctx)
  const altUrl = getAltUrl(ctx)
  const ogImage = getOgImage(ctx)
  const imgType = getOgImageType(ogImage)
  const pageTitle = getPageTitle(ctx)
  const isBlog = isBlogPage(ctx)
  const ogType = isBlog ? 'article' : 'website'

  const heads: HeadConfig[] = [
    // ---- OpenGraph ----
    ['meta', { property: 'og:type', content: ogType }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: desc }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:image:width', content: String(OG_IMAGE_WIDTH) }],
    ['meta', { property: 'og:image:height', content: String(OG_IMAGE_HEIGHT) }],
    ['meta', { property: 'og:image:type', content: imgType }],
    ['meta', { property: 'og:image:alt', content: pageTitle }],
    ['meta', { property: 'og:locale', content: locale }],
    ['meta', { property: 'og:locale:alternate', content: altLocale }],

    // ---- hreflang 双向 + x-default ----
    ['link', { rel: 'alternate', hreflang: locale, href: url }],
    ['link', { rel: 'alternate', hreflang: altLocale, href: altUrl }],
    [
      'link',
      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: isEnglish(ctx) ? `${SITE_URL}${canonicalPath(ctx.page)!.replace(/^\/en\//, '/')}` : url,
      },
    ],

    // ---- Twitter Card ----
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: desc }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    ['meta', { name: 'twitter:image:alt', content: pageTitle }],
    ['meta', { name: 'twitter:site', content: '@NextPilot' }],
    ['meta', { name: 'twitter:creator', content: '@NextPilot' }],
  ]

  // article 特有标签（仅博客文章）
  if (isBlog) {
    const published = toISODate(fm(ctx).date)
    const modified = toISODate(fm(ctx).lastUpdated) || published
    if (published) heads.push(['meta', { property: 'article:published_time', content: published }])
    if (modified) heads.push(['meta', { property: 'article:modified_time', content: modified }])
    heads.push(['meta', { property: 'article:author', content: PUBLISHER_NAME }])

    // article:section — 从 URL 路径提取分类（如 /blog/mavlink/ → mavlink）
    const path = canonicalPath(ctx.page)
    if (path) {
      const segs = path.replace(/\/+$/, '').split('/')
      const section = segs[segs.length - 2] // 倒数第二段
      if (section && section !== 'blog') {
        heads.push(['meta', { property: 'article:section', content: section }])
      }
    }

    // article:tag — 从 frontmatter.tags 读取
    const tags = fm(ctx).tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        if (tag) heads.push(['meta', { property: 'article:tag', content: String(tag) }])
      }
    }
  }

  return heads
}

// ---- Item 11: JSON-LD 结构化数据 (6 类) ----

/** 1. JSON-LD Organization（站点级，全站注入） */
function jsonLdOrganization(): HeadConfig {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: SAME_AS,
  }
  return ['script', { type: 'application/ld+json' }, JSON.stringify(ld)]
}

/** 2. JSON-LD WebSite + SearchAction（站点级，全站注入） */
function jsonLdWebSite(): HeadConfig {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
  return ['script', { type: 'application/ld+json' }, JSON.stringify(ld)]
}

/** 3. JSON-LD BreadcrumbList（每页注入，从 URL 路径推定面包屑） */
function jsonLdBreadcrumb(ctx: TransformContext): HeadConfig | null {
  const rawPath = canonicalPath(ctx.page)
  if (!rawPath || rawPath === '/') return null
  const clean = rawPath.replace(/\/+$/, '').replace(/\.html$/, '')
  const segs = clean.split('/').filter(Boolean)
  if (segs.length === 0) return null

  const items: { '@type': string; position: number; name: string; item: string }[] = [{ '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL }]
  let accumulated = ''
  for (let i = 0; i < segs.length; i++) {
    accumulated += '/' + segs[i]
    const name = segs[i]
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name,
      item: `${SITE_URL}${accumulated}${accumulated.endsWith('.html') ? '' : '/'}`,
    })
  }

  const ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items }
  return ['script', { type: 'application/ld+json' }, JSON.stringify(ld)]
}

/** 4. JSON-LD TechArticle（blog 页注入，含 datePublished/dateModified/keywords） */
function jsonLdTechArticle(ctx: TransformContext): HeadConfig | null {
  const title = getPageTitle(ctx)
  const desc = getDescription(ctx)
  const url = getPageUrl(ctx)
  const published = toISODate(fm(ctx).date)
  const modified = toISODate(fm(ctx).lastUpdated) || published

  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${url}#article`,
    headline: title,
    description: desc,
    url,
    inLanguage: isEnglish(ctx) ? 'en-US' : 'zh-CN',
    isAccessibleForFree: true,
    author: { '@type': 'Organization', name: PUBLISHER_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }

  if (published) ld.datePublished = published
  if (modified) ld.dateModified = modified
  if (fm(ctx).tags && Array.isArray(fm(ctx).tags)) ld.keywords = fm(ctx).tags

  return ['script', { type: 'application/ld+json' }, JSON.stringify(ld)]
}

/** 5. JSON-LD SoftwareApplication（软件/下载页注入） */
function jsonLdSoftwareApplication(ctx: TransformContext): HeadConfig | null {
  const title = getPageTitle(ctx)
  const desc = getDescription(ctx)
  const url = getPageUrl(ctx)
  const modified = toISODate(fm(ctx).lastUpdated)

  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${url}#software`,
    name: title,
    description: desc,
    url,
    applicationCategory: fm(ctx).applicationCategory || 'Multimedia',
    operatingSystem: 'Windows, Linux',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
    },
    author: { '@type': 'Organization', name: PUBLISHER_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  }

  if (fm(ctx).version) ld.softwareVersion = fm(ctx).version
  if (modified) ld.dateModified = modified

  return ['script', { type: 'application/ld+json' }, JSON.stringify(ld)]
}

/** 6. JSON-LD FAQPage（FAQ 页面注入，从 frontmatter.questions 读取 [{question, answer}]） */
function jsonLdFAQPage(ctx: TransformContext): HeadConfig | null {
  const questions = fm(ctx).questions
  if (!questions || !Array.isArray(questions) || questions.length === 0) return null

  const mainEntity = questions.map((q: { question: string; answer: string }) => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.answer,
    },
  }))

  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', '@id': `${getPageUrl(ctx)}#faq`, mainEntity }
  return ['script', { type: 'application/ld+json' }, JSON.stringify(ld)]
}

/** 7. JSON-LD Product（产品页注入） */
function jsonLdProduct(ctx: TransformContext): HeadConfig | null {
  const title = getPageTitle(ctx)
  const desc = getDescription(ctx)
  const url = getPageUrl(ctx)
  const ogImage = getOgImage(ctx)
  const modified = toISODate(fm(ctx).lastUpdated)

  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: title,
    description: desc,
    url,
    category: fm(ctx).productCategory || 'Vehicle',
    brand: { '@type': 'Brand', name: SITE_NAME },
    manufacturer: { '@type': 'Organization', name: SITE_NAME },
  }

  if (ogImage !== OG_IMAGE_DEFAULT) {
    ld.image = {
      '@type': 'ImageObject',
      url: ogImage,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      caption: title,
    }
  }

  if (modified) ld.dateModified = modified

  // 可选：评分（从 frontmatter.rating / frontmatter.reviewCount 读取）
  const rating = fm(ctx).rating
  const reviewCount = fm(ctx).reviewCount
  if (typeof rating === 'number' && rating >= 0 && rating <= 5) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      bestRating: 5,
      worstRating: 0,
      reviewCount: typeof reviewCount === 'number' ? reviewCount : 0,
    }
  }

  return ['script', { type: 'application/ld+json' }, JSON.stringify(ld)]
}

// ---- Item 13: 其他 Meta（referrer / creator / publisher） ----

/** Speakable Schema（语音搜索，Google Assistant / Siri 可朗读页面摘要） */
function jsonLdSpeakable(ctx: TransformContext): HeadConfig | null {
  const path = canonicalPath(ctx.page)
  if (!path) return null
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': getPageUrl(ctx),
    speakable: {
      '@type': 'SpeakableSpecification',
      xpath: ['/html/head/title', '/html/head/meta[@name="description"]/@content'],
    },
  }
  return ['script', { type: 'application/ld+json' }, JSON.stringify(ld)]
}

const referrerMeta: HeadConfig = ['meta', { name: 'referrer', content: 'strict-origin-when-cross-origin' }]
const creatorMeta: HeadConfig = ['meta', { name: 'creator', content: PUBLISHER_NAME }]
const publisherLink: HeadConfig = ['link', { rel: 'publisher', href: SITE_URL }]

// ---- 导出 ----

/** 站点级 JSON-LD（Organization + WebSite），在 config.mts 全局 head 注入 */
export const globalJsonLdHeads: HeadConfig[] = [jsonLdOrganization(), jsonLdWebSite()]

/** PWA manifest link（站点级） */
export const manifestHead: HeadConfig = ['link', { rel: 'manifest', href: '/site.webmanifest' }]

/** SVG 矢量图标（现代浏览器优先使用） */
export const svgFaviconHead: HeadConfig = ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]

/** 主题主色（用于浏览器地址栏/工具栏着色） */
export const themeColorHead: HeadConfig = ['meta', { name: 'theme-color', content: '#3451b2' }]

/** 全站级 meta（referrer / creator / publisher），非页面级，统一放入 config.mts 全局 head */
export const globalMetaHeads: HeadConfig[] = [referrerMeta, creatorMeta, publisherLink]

/** 搜索引擎验证标签占位（替换实际 token 后生效） */
export const verificationHeads: HeadConfig[] = [
  ['meta', { name: 'google-site-verification', content: 'REPLACE_WITH_GOOGLE_TOKEN' }],
  ['meta', { name: 'baidu-site-verification', content: 'codeva-REPLACE_WITH_BAIDU_TOKEN' }],
  ['meta', { name: 'msvalidate.01', content: 'REPLACE_WITH_BING_TOKEN' }],
]

/** Apple Touch Icon（iOS Safari 添加到主屏幕） */
export const appleTouchIconHead: HeadConfig = ['link', { rel: 'apple-touch-icon', href: '/logo.png' }]

/** Safari Pinned Tab 图标（mask-icon） */
export const safariMaskIconHead: HeadConfig = ['link', { rel: 'mask-icon', href: '/logo.png', color: '#3451b2' }]

/** DNS 预解析与预连接（百度统计） */
export const resourceHintHeads: HeadConfig[] = [
  ['link', { rel: 'dns-prefetch', href: '//hm.baidu.com' }],
  ['link', { rel: 'preconnect', href: 'https://hm.baidu.com' }],
]

/**
 * 统一的 transformHead：合并 canonical + hreflang + OG/Twitter + robots + JSON-LD
 * 作为 config.mts 的 transformHead 值。
 */
export function transformHead(ctx: TransformContext): HeadConfig[] {
  const heads: HeadConfig[] = []

  // Item 2: Canonical（每页自引）
  const path = canonicalPath(ctx.page)
  if (path) heads.push(['link', { rel: 'canonical', href: `${SITE_URL}${path}` }])

  // Item 1: Title（Dublin Core）
  heads.push(['meta', { name: 'dc:title', content: getFullTitle(ctx) }])
  heads.push(['meta', { name: 'dc:description', content: getDescription(ctx) }])
  heads.push(['meta', { name: 'dc:creator', content: PUBLISHER_NAME }])

  // Item 3 & 4 & 5: OG / Twitter / hreflang
  heads.push(...ogTwitterMeta(ctx))

  // Item 6: Robots Meta
  const robots = robotsMeta(ctx)
  if (robots) heads.push(robots)

  // Item 12: BreadcrumbList JSON-LD
  const breadcrumb = jsonLdBreadcrumb(ctx)
  if (breadcrumb) heads.push(breadcrumb)

  // Speakable（语音搜索，每页）
  const speakable = jsonLdSpeakable(ctx)
  if (speakable) heads.push(speakable)

  // Item 11: 按页面类型注入对应的 JSON-LD（FAQ 优先检测）
  if (isFAQPage(ctx)) {
    const faq = jsonLdFAQPage(ctx)
    if (faq) heads.push(faq)
  } else if (isBlogPage(ctx)) {
    const article = jsonLdTechArticle(ctx)
    if (article) heads.push(article)
  } else if (isSoftwarePage(ctx)) {
    const software = jsonLdSoftwareApplication(ctx)
    if (software) heads.push(software)
  } else if (isProductPage(ctx)) {
    const product = jsonLdProduct(ctx)
    if (product) heads.push(product)
  }

  return heads
}
