/* global URL, process */
// EdgeOne Pages 中间件：旧文档路径 301、域名归一与跳转。
// 站点权威域名固定为 nextpilot.org；仅当设置 USE_URL_REDIRECT=1（或 true）时才强制归一非权威域名，否则放行。
// 注：EdgeOne 边缘运行时读取环境变量的方式以官方文档为准，此处按 Node 兼容写法读取 process.env。
const SITE_HOST = 'nextpilot.org'
const SITE_URL = 'https://' + SITE_HOST
const USE_URL_REDIRECT = typeof process !== 'undefined' && process.env && (process.env.USE_URL_REDIRECT === '1' || process.env.USE_URL_REDIRECT === 'true')

/**
 * 旧文档路径 → /docs 下的新路径；非旧路径返回 null。
 * /manual/(.*)          → /docs/manual/$1
 * /opensource/guide/*    → /docs/guide/*（develop / community 同理）
 * /opensource(/)?        → /docs/
 */
function legacyDocsPath(pathname) {
  let m = pathname.match(/^\/manual(?:\/(.*))?$/)
  if (m) return '/docs/manual/' + (m[1] || '')
  m = pathname.match(/^\/opensource\/(guide|develop|community)(?:\/(.*))?$/)
  if (m) return `/docs/${m[1]}/` + (m[2] || '')
  if (pathname === '/opensource' || pathname === '/opensource/') return '/docs/'
  return null
}

export function middleware(context) {
  const { request, redirect } = context
  const url = new URL(request.url)

  // 权威域名：旧文档路径一律 301 到 /docs（结构迁移，与域名归一开关无关）
  if (url.hostname === SITE_HOST) {
    const legacy = legacyDocsPath(url.pathname)
    if (legacy) return redirect(`${SITE_URL}${legacy}${url.search}`, 301)
    return context.next()
  }

  if (!USE_URL_REDIRECT) return context.next()

  // docs.* 子域名：旧站整体对应产品手册，落地到 /docs/manual
  if (url.hostname.startsWith('docs.')) {
    const path = url.pathname === '/' ? '/docs/manual/' : `/docs/manual${url.pathname}`
    return redirect(`${SITE_URL}${path}${url.search}`, 301)
  }

  // 其它任何域名：统一跳转到主站（保留路径）；旧文档路径同时归一到 /docs
  const legacy = legacyDocsPath(url.pathname)
  const path = legacy || url.pathname
  return redirect(`${SITE_URL}${path}${url.search}`, 301)
}

// 匹配所有路由
export const config = {
  matcher: ['/:path*'],
}
