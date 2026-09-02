/**
 * 通用 tab 组容器插件（markdown-it block rule + renderer）。
 *
 * 语法：
 * ```
 * ::: tabs
 * @tab 标题一
 * 内容一
 * @tab 标题二
 * 内容二
 * :::
 * ```
 *
 * 每个 `@tab 标题` 行作为 tab 分隔符（标题为 tab 名），`:::` 关闭容器。
 * 无需在 config.mts 注册 customContainers，本插件的 block rule 直接解析。
 */

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function markdownTab(md: any): void {
  // `config(md)` 可能被调用多次，避免重复注册
  if (md.__markdownTabRegistered) return
  md.__markdownTabRegistered = true

  // block rule：解析 `::: tabs` + `@tab 标题` 分隔符
  md.block.ruler.before('fence', 'markdown_tabs', (state: any, startLine: number, endLine: number, silent: boolean) => {
    const start = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]
    if (state.src.slice(start, max).trim() !== '::: tabs') return false
    if (silent) return true

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

    // 按 `@tab 标题` 切分内层行
    const tabs: { title: string; start: number; end: number }[] = []
    let curTitle = ''
    let curStart = startLine + 1
    for (let line = startLine + 1; line < closeLine; line++) {
      const p = state.bMarks[line] + state.tShift[line]
      const m = state.eMarks[line]
      const t = state.src.slice(p, m).trim()
      const mm = t.match(/^@tab\s+(.+)$/)
      if (mm) {
        // 跳过第一个 `@tab` 之前的空内容（如 `::: tabs` 后的空行），避免生成空 tab
        if (curTitle && curStart < line) tabs.push({ title: curTitle, start: curStart, end: line })
        curTitle = mm[1].trim()
        curStart = line + 1
      }
    }
    if (curTitle && curStart < closeLine) tabs.push({ title: curTitle, start: curStart, end: closeLine })

    // 少于两个 tab 时，按普通内容渲染（不生成 tab 结构）
    if (tabs.length < 2) {
      state.md.block.tokenize(state, startLine + 1, closeLine)
      state.lineMax = savedLineMax
      state.line = closeLine + 1
      return true
    }

    const openTok = state.push('markdown_tabs_open', 'div', 1)
    openTok.block = true
    openTok.meta = { titles: tabs.map((t) => t.title) }

    tabs.forEach((tab, n) => {
      // 剥离 tab 内容的公共缩进，避免缩进正文被当作缩进代码块（如 4 空格）
      let indent = Number.POSITIVE_INFINITY
      for (let line = tab.start; line < tab.end; line++) {
        if (!state.isEmpty(line)) indent = Math.min(indent, state.sCount[line])
      }
      if (!Number.isFinite(indent)) indent = state.blkIndent
      indent = Math.max(0, indent - state.blkIndent)

      const savedIndent = state.blkIndent
      state.blkIndent += indent

      const tabOpen = state.push('markdown_tab_open', 'div', 1)
      tabOpen.block = true
      tabOpen.meta = { index: n }
      state.md.block.tokenize(state, tab.start, tab.end)
      const tabClose = state.push('markdown_tab_close', 'div', -1)
      tabClose.block = true

      state.blkIndent = savedIndent
    })

    const closeTok = state.push('markdown_tabs_close', 'div', -1)
    closeTok.block = true

    state.lineMax = savedLineMax
    state.line = closeLine + 1
    return true
  })

  // renderer rules：生成 tab UI
  md.renderer.rules.markdown_tabs_open = (tokens: any[], idx: number) => {
    const titles: string[] = tokens[idx].meta?.titles || []
    const nav = titles.map((t, n) => `<button type="button" class="markdown-tab-btn${n === 0 ? ' is-active' : ''}" data-tab="${n}" role="tab" aria-selected="${n === 0}">${escapeHtml(t)}</button>`).join('')
    return `<div class="markdown-tab"><div class="markdown-tab-nav" role="tablist">${nav}</div><div class="markdown-tab-panels">`
  }
  md.renderer.rules.markdown_tabs_close = () => `</div></div>`
  md.renderer.rules.markdown_tab_open = (tokens: any[], idx: number) => {
    const n = tokens[idx].meta?.index ?? 0
    return `<div class="markdown-tab-panel${n === 0 ? ' is-active' : ''}" data-panel="${n}" role="tabpanel">`
  }
  md.renderer.rules.markdown_tab_close = () => `</div>`
}
