/**
 * 标题 tab 化插件（markdown-it core rule）。
 *
 * 对声明 `layout: product` 的页面生效：把正文中每个二级标题（##）及其后续内容
 * 折叠为一个 tab（标题作为 tab 名称），少于两个二级标题时不处理。
 * 机制通用，与栏目目录解耦。
 *
 * 通过注入 `html_block` token 包裹成 tab 结构，配合 ProductLayout.vue 的
 * CSS 与事件委托完成切换。
 */

interface Group {
  title: string
  tokens: any[]
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 从 inline children 中提取纯文本（用于 tab 标题），跳过标题锚点的零宽空格 */
function extractText(tokens: any[]): string {
  let out = ''
  for (const t of tokens) {
    if (t.type === 'text' || t.type === 'code_inline') out += t.content
    else if (t.children) out += extractText(t.children)
    else if (t.type === 'html_inline' && t.content === '&#8203;') continue
    else if (t.content) out += t.content
  }
  return out.trim()
}

export function productHeadingTabs(md: any): void {
  // `config(md)` 可能被调用多次，避免重复注册同一 core rule（会导致重复渲染）
  if (md.__productHeadingTabsRegistered) return
  md.__productHeadingTabsRegistered = true

  md.core.ruler.push('product_heading_tabs', (state: any) => {
    // 仅对声明 `layout: product` 的页面生效（详情页），与目录无关
    if (state.env?.frontmatter?.layout !== 'product') return

    const tokens = state.tokens
    const groups: Group[] = []
    let current: any[] | null = null
    let currentTitle = ''

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i]
      if (tok.type === 'heading_open' && tok.tag === 'h2') {
        if (current) groups.push({ title: currentTitle, tokens: current })
        current = [tok]
        const inline = tokens[i + 1]
        currentTitle = inline && inline.type === 'inline' ? extractText(inline.children || []) : ''
      } else if (current) {
        current.push(tok)
      }
    }
    if (current) groups.push({ title: currentTitle, tokens: current })

    // 少于两个分组时不生成 tab
    if (groups.length < 2) return

    const html = (content: string) => {
      const t = new state.Token('html_block', '', 0)
      t.content = content
      t.block = true
      return t
    }

    const buttons = groups
      .map(
        (g, i) =>
          `<button type="button" class="product-tab${i === 0 ? ' is-active' : ''}" data-tab="${i}" role="tab" aria-selected="${i === 0}">${escapeHtml(g.title)}</button>`,
      )
      .join('')

    const out: any[] = [
      html(
        `<div class="product-tabs"><div class="product-tab-list" role="tablist">${buttons}</div><div class="product-tab-panels">`,
      ),
    ]

    groups.forEach((g, i) => {
      out.push(
        html(
          `<div class="product-tab-panel${i === 0 ? ' is-active' : ''}" data-panel="${i}" role="tabpanel">`,
        ),
      )
      out.push(...g.tokens)
      out.push(html('</div>'))
    })

    out.push(html('</div></div>'))

    state.tokens = out
  })
}
