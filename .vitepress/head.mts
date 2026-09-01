import type { HeadConfig, TransformContext } from 'vitepress'

// 站点权威域名，固定为 nextpilot.org（不再依赖 SITE_HOST 环境变量），
// canonical 与 sitemap 始终指向该域名。
const SITE_HOST = 'nextpilot.org'

// 完整站点 URL
export const SITE_URL = `https://${SITE_HOST}`

// 是否启用客户端域名归一跳转：仅当构建环境设置 USE_URL_REDIRECT=1（或 true）时才注入跳转脚本。
// 本地开发与预览部署应保持关闭，避免访问时被跳转到线上域名。
const USE_URL_REDIRECT = process.env.USE_URL_REDIRECT === '1' || process.env.USE_URL_REDIRECT === 'true'

// 源文件路径（相对 srcDir，如 index.md / manual/index.md / manual/foo.md）→ 权威 URL
// 与 sitemap 一致：目录页尾斜杠（/manual/）、详情页带 .html（/manual/foo.html）
function canonicalPath(page: string): string | null {
  if (page === '404.md') return null
  if (page === 'index.md') return '/'
  if (page.endsWith('/index.md')) return '/' + page.slice(0, -'index.md'.length)
  return '/' + page.replace(/\.md$/, '.html')
}

// 客户端域名归一脚本（仅当 USE_URL_REDIRECT 开启时注入）
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

export const redirectHead: HeadConfig[] = USE_URL_REDIRECT ? [redirectScript] : []

// 给每页加 canonical，始终指向权威域名 nextpilot.org
export function canonicalHead(ctx: TransformContext): HeadConfig[] {
  const path = canonicalPath(ctx.page)
  if (!path) return []
  return [['link', { rel: 'canonical', href: `${SITE_URL}${path}` }]]
}
