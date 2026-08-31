/* global URL, process */
// EdgeOne Pages 中间件：域名归一与跳转。
// 仅当设置了环境变量 SITE_HOST 时才强制归一；未设置则所有域名都放行。
// 注：EdgeOne 边缘运行时读取环境变量的方式以官方文档为准，此处按 Node 兼容写法读取 process.env。
const SITE_HOST = (typeof process !== 'undefined' && process.env && process.env.SITE_HOST) || ''
const SITE_URL = SITE_HOST ? 'https://' + SITE_HOST : ''

export function middleware(context) {
  const { request, redirect } = context
  const url = new URL(request.url)

  if (!SITE_HOST) return context.next()

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
