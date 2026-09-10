/**
 * 卡片容器插件（markdown-it block rule + renderer），语法 `::: xxx-card`，按 xxx 渲染不同卡片。
 * 卡片内容用 ```yml 代码块包裹，每张卡片一个 ```yml 块（flat `key: value`），或一个块内 `- key: value` 列表。
 *
 * 图文卡片 image-card 字段：cover / link / name / desc / author / avatar；
 * 链接卡片 link-card 字段：link / name / desc / icon（emoji 或 / 开头的站内图片路径）/
 * links（卡片底部直达链接，写法 `名称|URL`，多个以 ；;，, 分隔）；
 * 产品卡片 product-card 字段：cover / link / name / desc / price / category / shopUrl / helpUrl。
 */

interface Card {
  cover?: string
  link: string
  name: string
  desc?: string
  icon?: string
  links?: { name: string; link: string }[]
  summary?: string
  price?: string
  category?: string
  shopUrl?: string
  helpUrl?: string
  author?: string
  avatar?: string
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// 外链（http(s):// 或协议相对 //）新标签打开；站内链接当前窗口跳转
function externalAttr(url: string): string {
  return /^(?:https?:)?\/\//.test(url) ? ' target="_blank" rel="noopener noreferrer"' : ''
}

// icon 为站内图片路径（/ 开头）或远程图片 URL 时渲染 <img>，否则按 emoji/字符原样渲染
function isImageUrl(url: string): boolean {
  return /^(?:https?:)?\/\//.test(url) || url.startsWith('/')
}

// 解析卡片底部直达链接：`名称|URL` 多项，以 ；;，, 分隔
function parseLinks(raw?: string): { name: string; link: string }[] {
  if (!raw) return []
  return raw
    .split(/[;；,，]\s*/)
    .map((item) => {
      const idx = item.indexOf('|')
      if (idx < 0) return null
      const name = item.slice(0, idx).trim()
      const link = item.slice(idx + 1).trim()
      return name && link ? { name, link } : null
    })
    .filter((x): x is { name: string; link: string } => x !== null)
}

// 解析 `key: value`，按第一个冒号切分
function splitKeyValue(line: string): [string, string] {
  const idx = line.indexOf(':')
  if (idx < 0) return ['', '']
  return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
}

// 解析卡片内容：每个 ```yml 块 = 一张卡片（flat key: value），或块内 `- key: value` 列表
function parseCards(content: string): Card[] {
  const rawCards: Record<string, string>[] = []
  let current: Record<string, string> | null = null

  for (const raw of content.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('```')) {
      current = null // 代码围栏：结束当前 flat 卡片
      continue
    }
    if (line.startsWith('- ')) {
      current = {}
      rawCards.push(current)
      const [k, v] = splitKeyValue(line.slice(2).trim())
      if (k) current[k] = v
      continue
    }
    const [k, v] = splitKeyValue(line)
    if (!k) continue
    if (current === null) {
      current = {} // 新的 flat 卡片
      rawCards.push(current)
    }
    current[k] = v
  }

  return rawCards.map((c) => ({
    cover: c.cover,
    link: c.link || '',
    name: c.name || '',
    desc: c.desc,
    icon: c.icon,
    links: parseLinks(c.links),
    summary: c.summary,
    price: c.price,
    category: c.category,
    shopUrl: c.shopUrl,
    helpUrl: c.helpUrl,
    author: c.author,
    avatar: c.avatar,
  }))
}

export function markdownCard(md: any): void {
  // `config(md)` 可能被调用多次，避免重复注册
  if (md.__markdownCardRegistered) return
  md.__markdownCardRegistered = true

  // block rule：解析 `::: xxx-card [每行数量]`，按 xxx 分发（image / link / product）
  md.block.ruler.before('fence', 'markdown_card', (state: any, startLine: number, endLine: number, silent: boolean) => {
    const start = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]
    const openText = state.src.slice(start, max).trim()
    const openMatch = openText.match(/^::: (\w+)-card(?:\s+(.+))?$/)
    if (!openMatch) return false
    const type = openMatch[1]
    if (type !== 'image' && type !== 'link' && type !== 'product') return false // 支持 image / link / product
    if (silent) return true
    const count = (openMatch[2] || '').trim() || 'auto'

    const savedLineMax = state.lineMax
    const indent = state.sCount[startLine]

    // 找到关闭 `:::`
    let closeLine = startLine + 1
    while (closeLine < endLine) {
      const p = state.bMarks[closeLine] + state.tShift[closeLine]
      const m = state.eMarks[closeLine]
      const t = state.src.slice(p, m).trim()
      if (t === ':::' && state.sCount[closeLine] <= indent) break
      closeLine++
    }

    // 提取并解析内容
    const lines: string[] = []
    for (let line = startLine + 1; line < closeLine; line++) {
      const p = state.bMarks[line] + state.tShift[line]
      const m = state.eMarks[line]
      lines.push(state.src.slice(p, m))
    }
    const cards = parseCards(lines.join('\n'))

    const token = state.push('markdown_card', 'div', 0)
    token.block = true
    token.meta = { type, count, cards }

    state.lineMax = savedLineMax
    state.line = closeLine + 1
    return true
  })

  // renderer：按类型渲染卡片网格
  md.renderer.rules.markdown_card = (tokens: any[], idx: number) => {
    const { type, count, cards }: { type: string; count: string; cards: Card[] } = tokens[idx].meta

    // 数字列数输出 cols-N 类（响应式降级见 style.css）；缺省 auto-fill 时走内联样式
    const colsMatch = count.match(/^\d+$/)
    const colsClass = colsMatch ? ` cols-${Math.min(Math.max(Number(colsMatch[0]), 1), 4)}` : ''
    const gridStyle = colsMatch ? 'gap: 20px;' : 'grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px;'

    const items = cards
      .map((c) => {
        if (type === 'image') {
          const footer =
            c.author || c.avatar ? `<div class="image-card-footer">${c.avatar ? `<img class="image-card-avatar" src="${escapeHtml(c.avatar)}" alt="" />` : ''}${c.author ? `<span class="image-card-author">${escapeHtml(c.author)}</span>` : ''}</div>` : ''
          return `<a class="image-card" href="${escapeHtml(c.link)}"${externalAttr(c.link)}><img class="image-card-image" src="${escapeHtml(c.cover || '')}" alt="${escapeHtml(c.name)}" /><div class="image-card-body">${c.name ? `<div class="image-card-name">${escapeHtml(c.name)}</div>` : ''}${c.desc ? `<div class="image-card-desc">${escapeHtml(c.desc)}</div>` : ''}${footer}</div></a>`
        }
        if (type === 'product') {
          const catHtml = c.category ? `<span class="card-cat">${escapeHtml(c.category)}</span>` : ''
          const summaryHtml = c.summary ? `<p class="card-summary">${escapeHtml(c.summary)}</p>` : ''
          const priceHtml = c.price ? `<span class="card-price">¥${escapeHtml(c.price)}</span>` : ''
          const buyBtn = c.shopUrl ? `<a class="card-btn card-btn-buy" href="${escapeHtml(c.shopUrl)}" target="_blank" rel="noopener noreferrer">购买</a>` : ''
          const helpBtn = c.helpUrl ? `<a class="card-btn card-btn-help" href="${escapeHtml(c.helpUrl)}">帮助</a>` : ''
          const actions = buyBtn || helpBtn ? `<div class="card-actions">${buyBtn}${helpBtn}</div>` : ''
          return `<div class="product-card"><a class="card-main" href="${escapeHtml(c.link)}"${externalAttr(c.link)}><img class="card-cover" src="${escapeHtml(c.cover || '')}" alt="${escapeHtml(c.name)}" /><div class="card-body"><div class="card-title-row"><h3 class="card-title">${escapeHtml(c.name)}</h3>${catHtml}</div>${summaryHtml}</div></a><div class="card-foot">${priceHtml}${actions}</div></div>`
        }
        const iconHtml = c.icon ? `<span class="link-card-icon">${isImageUrl(c.icon) ? `<img src="${escapeHtml(c.icon)}" alt="" />` : escapeHtml(c.icon)}</span>` : ''
        const headInner = `${iconHtml}${c.name ? `<span class="link-card-name">${escapeHtml(c.name)}</span>` : ''}`
        // 卡片头本身为主链接（卡片底部还可能有直达子链接，不能 <a> 嵌套 <a>，故根元素用 div）
        const headHtml = c.link ? `<a class="link-card-head" href="${escapeHtml(c.link)}"${externalAttr(c.link)}>${headInner}</a>` : `<div class="link-card-head">${headInner}</div>`
        const linksHtml = c.links?.length ? `<div class="link-card-links">${c.links.map((l) => `<a href="${escapeHtml(l.link)}"${externalAttr(l.link)}>${escapeHtml(l.name)}</a>`).join('')}</div>` : ''
        return `<div class="link-card">${headHtml}${c.desc ? `<div class="link-card-desc">${escapeHtml(c.desc)}</div>` : ''}${linksHtml}</div>`
      })
      .join('')

    const gridClass = (type === 'image' ? 'image-card-grid' : type === 'product' ? 'product-card-grid' : 'link-card-grid') + colsClass
    return `<div class="${gridClass}" style="${gridStyle}">${items}</div>`
  }
}
