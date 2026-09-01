/* global URL, process */
// EdgeOne Pages 中间件：域名归一与跳转。
// 站点权威域名固定为 nextpilot.org；仅当设置 USE_URL_REDIRECT=1（或 true）时才强制归一，否则所有域名放行。
// 注：EdgeOne 边缘运行时读取环境变量的方式以官方文档为准，此处按 Node 兼容写法读取 process.env。
const SITE_HOST = 'nextpilot.org'
const SITE_URL = 'https://' + SITE_HOST
const USE_URL_REDIRECT =
  typeof process !== 'undefined' &&
  process.env &&
  (process.env.USE_URL_REDIRECT === '1' || process.env.USE_URL_REDIRECT === 'true')

export function middleware(context) {
  const { request, redirect } = context
  const url = new URL(request.url)

  if (!USE_URL_REDIRECT) return context.next()

  if (url.hostname === SITE_HOST) {
    return context.next()
  }

  if (url.hostname.startsWith('docs.')) {
    const path = url.pathname === '/' ? '/manual/' : `/manual${url.pathname}`
    return redirect(`${SITE_URL}${path}${url.search}`, 301)
  }

  // 其它任何域名：统一跳转到主站（保留路径）
  return redirect(`${SITE_URL}${url.pathname}${url.search}`, 301)
}

// 匹配所有路由
export const config = {
  matcher: ['/:path*'],
}
