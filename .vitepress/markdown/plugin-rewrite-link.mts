import { posix } from 'node:path'
import { resolvePageUrl } from '../config/rewrites.mts'

// 内容源目录的绝对路径（POSIX 风格），用于把内链目标解析为相对 srcDir 的源路径
const slash = (p: string) => p.replace(/\\/g, '/')
const srcDirAbs = slash(process.cwd()).replace(/\/$/, '') + '/source'

/**
 * markdown-it core rule：把站内 .md 链接的物理路径（含排序前缀）改写为最终 URL 路径。
 * 作者在正文里写物理路径（如 `../04-config/01-basic-setup.md`），构建期自动转为
 * `/opensource/guide/config/basic-setup.md`；若目标页声明了 permalink，则指向 permalink URL。
 */
export function rewriteLink(md: any): void {
  // `config(md)` 可能被调用多次，避免重复注册同一 core rule
  if (md.__rewriteLinkRegistered) return
  md.__rewriteLinkRegistered = true

  md.core.ruler.push('rewrite_link', (state: any) => {
    // 当前页面的源文件绝对路径（env.realPath 为源路径，env.path 为 rewrite 后路径）
    const realPath = state.env?.realPath || state.env?.path
    if (!realPath) return
    const currentDir = posix.dirname(slash(realPath))

    const walk = (tokens: any[]) => {
      for (const token of tokens) {
        if (token.type === 'link_open') {
          const href = token.attrGet('href')
          if (href) {
            const next = rewriteHref(href, currentDir)
            if (next !== href) token.attrSet('href', next)
          }
        }
        if (token.children) walk(token.children)
      }
    }
    walk(state.tokens)
  })
}

/** 判断是否站内页面链接：.md 文件 / 目录链接（结尾 `/`）/ 省略扩展名的物理路径（段首「数字-」） */
function isPageLink(path: string): boolean {
  if (path.endsWith('.md') || path.endsWith('/')) return true
  // 无扩展名且段首为「数字-」→ 省略了 .md 的物理路径（含排序前缀，需改写）
  if (/\.\w+$/.test(path)) return false
  return /(^|\/)\d+-/.test(path)
}

function rewriteHref(href: string, currentDir: string): string {
  // 外链 / 锚点 / 协议相对
  if (/^(?:https?:|mailto:|tel:|#)/i.test(href) || href.startsWith('//')) return href

  const m = href.match(/^([^?#]*)([?#].*)?$/)
  // markdown-it 会把中文等非 ASCII 字符 URL 编码，先解码回真实文件路径再解析
  let path: string
  try {
    path = decodeURI(m![1])
  } catch {
    path = m![1]
  }
  const suffix = m![2] || ''
  if (!isPageLink(path)) return href

  // 目录链接补 index.md；无扩展名的物理路径统一补 .md，保证 readPermalink 能命中文件
  let target = path.endsWith('/') ? path + 'index.md' : path
  if (!target.endsWith('.md')) target += '.md'

  // 解析为相对 srcDir 的源路径（绝对路径去前导 /，相对路径相对当前文件目录）
  const srcPath = target.startsWith('/')
    ? target.slice(1)
    : posix.relative(srcDirAbs, posix.normalize(posix.join(currentDir, target)))

  // 解析最终 URL（permalink > 去前缀），保留 .md 交给 VitePress normalizeHref 转 .html / 目录
  return '/' + resolvePageUrl(srcPath) + suffix
}
