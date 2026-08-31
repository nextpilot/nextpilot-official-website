import type { HeadConfig, TransformContext } from 'vitepress'

// 站点权威域名：设置了 SITE_HOST 才强制域名归一（跳转 + canonical）；未设置则任意域名可访问。
// 生产部署时必须在构建环境（EdgeOne Pages 构建命令）设置 SITE_HOST=nextpilot.org，
// 否则站点不会生成 canonical / sitemap / 跳转脚本。
const SITE_HOST = process.env.SITE_HOST || ''

// 完整站点 URL（仅当 SITE_HOST 设置时有意义）
export const SITE_URL = SITE_HOST ? `https://${SITE_HOST}` : ''

// 源文件路径（相对 srcDir，如 index.md / manual/index.md / manual/foo.md）→ 权威 URL
// 与 sitemap 一致：目录页尾斜杠（/manual/）、详情页带 .html（/manual/foo.html）
function canonicalPath(page: string): string | null {
  if (page === '404.md') return null
  if (page === 'index.md') return '/'
  if (page.endsWith('/index.md')) return '/' + page.slice(0, -'index.md'.length)
  return '/' + page.replace(/\.md$/, '.html')
}

// 客户端域名归一脚本（仅当设置了 SITE_HOST 时注入）
const redirectScript: HeadConfig = [
  'script',
  {},
  `(function () {
    var host = location.hostname
    if (host === '${SITE_HOST}') return
    if (host.startsWith('docs.')) {
      var path = location.pathname === '/' ? '/manual/' : '/manual' + location.pathname
      location.replace('${SITE_URL}' + path + location.search)
      return
    }
    location.replace('${SITE_URL}' + location.pathname + location.search)
  })()`,
]

export const redirectHead: HeadConfig[] = SITE_HOST ? [redirectScript] : []

// 多域名归一：给每页加 canonical（仅当设置了 SITE_HOST 时）
export function canonicalHead(ctx: TransformContext): HeadConfig[] {
  if (!SITE_HOST) return []
  const path = canonicalPath(ctx.page)
  if (!path) return []
  return [['link', { rel: 'canonical', href: `${SITE_URL}${path}` }]]
}
