/**
 * 卡片容器插件（markdown-it block rule + renderer），语法 `::: xxx-card`，按 xxx 渲染不同卡片。
 * 卡片内容用 ```yml 代码块包裹，每张卡片一个 ```yml 块（flat `key: value`），或一个块内 `- key: value` 列表。
 *
 * 图文卡片 image-card 字段：cover / link / name / desc / author / avatar；
 * 链接卡片 link-card 字段：link / name / desc；
 * 产品卡片 product-card 字段：cover / link / name / desc / price / category / shopUrl / helpUrl。
 */

interface Card {
  cover?: string
  link: string
  name: string
  desc?: string
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

    const cols = /^\d+$/.test(count) ? `repeat(${Math.min(Math.max(Number(count), 1), 4)}, 1fr)` : 'repeat(auto-fill, minmax(240px, 1fr))'
    const gridStyle = `grid-template-columns: ${cols}; gap: 20px;`

    const items = cards
      .map((c) => {
        if (type === 'image') {
          const footer =
            c.author || c.avatar ? `<div class="image-card-footer">${c.avatar ? `<img class="image-card-avatar" src="${escapeHtml(c.avatar)}" alt="" />` : ''}${c.author ? `<span class="image-card-author">${escapeHtml(c.author)}</span>` : ''}</div>` : ''
          return `<a class="image-card" href="${escapeHtml(c.link)}" target="_blank" rel="noopener noreferrer"><img class="image-card-image" src="${escapeHtml(c.cover || '')}" alt="${escapeHtml(c.name)}" /><div class="image-card-body">${c.name ? `<div class="image-card-name">${escapeHtml(c.name)}</div>` : ''}${c.desc ? `<div class="image-card-desc">${escapeHtml(c.desc)}</div>` : ''}${footer}</div></a>`
        }
        if (type === 'product') {
          const catHtml = c.category ? `<span class="card-cat">${escapeHtml(c.category)}</span>` : ''
          const summaryHtml = c.summary ? `<p class="card-summary">${escapeHtml(c.summary)}</p>` : ''
          const priceHtml = c.price ? `<span class="card-price">¥${escapeHtml(c.price)}</span>` : ''
          const buyBtn = c.shopUrl ? `<a class="card-btn card-btn-buy" href="${escapeHtml(c.shopUrl)}" target="_blank" rel="noopener noreferrer">购买</a>` : ''
          const helpBtn = c.helpUrl ? `<a class="card-btn card-btn-help" href="${escapeHtml(c.helpUrl)}">帮助</a>` : ''
          const actions = buyBtn || helpBtn ? `<div class="card-actions">${buyBtn}${helpBtn}</div>` : ''
          return `<div class="product-card"><a class="card-main" href="${escapeHtml(c.link)}"><img class="card-cover" src="${escapeHtml(c.cover || '')}" alt="${escapeHtml(c.name)}" /><div class="card-body"><div class="card-title-row"><h3 class="card-title">${escapeHtml(c.name)}</h3>${catHtml}</div>${summaryHtml}</div></a><div class="card-foot">${priceHtml}${actions}</div></div>`
        }
        return `<a class="link-card" href="${escapeHtml(c.link)}" target="_blank" rel="noopener noreferrer">${c.name ? `<div class="link-card-name">${escapeHtml(c.name)}</div>` : ''}${c.desc ? `<div class="link-card-desc">${escapeHtml(c.desc)}</div>` : ''}</a>`
      })
      .join('')

    const gridClass = type === 'image' ? 'image-card-grid' : type === 'product' ? 'product-card-grid' : 'link-card-grid'
    return `<div class="${gridClass}" style="${gridStyle}">${items}</div>`
  }
}
