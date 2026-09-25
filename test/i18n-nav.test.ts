import { describe, it, expect } from 'vitest'
import { docsNavbar } from '../.vitepress/config/navbar.mts'
import { docsSidebar } from '../.vitepress/config/sidebar.mts'
import { getFinalUrl } from '../.vitepress/config/page.mts'

/** 递归收集导航/侧边栏树内所有 link（含自定义字段 sectionLink） */
function collectLinks(items: any[], acc: string[] = []): string[] {
  for (const item of items) {
    if (item.link) acc.push(item.link)
    if (item.sectionLink) acc.push(item.sectionLink)
    if (item.items) collectLinks(item.items, acc)
  }
  return acc
}

/** 递归收集所有显示文本 */
function collectTexts(items: any[], acc: string[] = []): string[] {
  for (const item of items) {
    if (item.text) acc.push(item.text)
    if (item.items) collectTexts(item.items, acc)
  }
  return acc
}

const zhNav = docsNavbar('source/zh')
const enNav = docsNavbar('source/en', 'en')

describe('英文站导航 docsNavbar(source/en, en)', () => {
  it('生成非空英文导航', () => {
    expect(enNav.length).toBeGreaterThan(0)
  })

  it('所有链接都带 /en/ 前缀', () => {
    const links = collectLinks(enNav)
    expect(links.length).toBeGreaterThan(10)
    for (const link of links) expect(link.startsWith('/en/')).toBe(true)
  })

  it('不含任何中文站链接（防止英文标题配中文链接）', () => {
    for (const link of collectLinks(enNav)) {
      expect(link).not.toMatch(/^\/(blog|docs|download|product|solution|about)\//)
    }
  })

  it('英文未提供 news / discovery 栏目，导航中自然缺失', () => {
    const texts = collectTexts(enNav).join(' | ')
    expect(texts).not.toMatch(/动态|发现|News|Discovery/)
  })

  it('标题取自英文内容，不含中文字符', () => {
    for (const text of collectTexts(enNav)) {
      expect(text).not.toMatch(/[一-龥]/)
    }
  })
})

describe('中文站导航不受影响', () => {
  it('中文导航链接依旧不含 /zh/ 也不含 /en/', () => {
    for (const link of collectLinks(zhNav)) {
      expect(link.startsWith('/en/')).toBe(false)
      expect(link).not.toContain('/zh/')
    }
  })

  it('中英文导航栏目数量一致时，结构保持一致（仅语言段不同）', () => {
    const zhLinks = collectLinks(zhNav).filter((l) => !l.startsWith('/en/'))
    const enLinks = collectLinks(enNav).map((l) => l.replace(/^\/en/, ''))
    // 英文缺 news/discovery，故英文链接集合应是中文的子集
    for (const en of enLinks) expect(zhLinks).toContain(en)
  })
})

describe('英文站侧边栏 docsSidebar(source/en, ...)', () => {
  it('docs 栏目生成非空侧边栏', () => {
    expect(docsSidebar('source/en', 'docs', 'en').length).toBeGreaterThan(0)
  })

  it('侧边栏所有链接都带 /en/ 前缀', () => {
    for (const link of collectLinks(docsSidebar('source/en', 'docs', 'en'))) {
      expect(link.startsWith('/en/')).toBe(true)
    }
  })

  it('中文侧边栏链接保持裸路由', () => {
    for (const link of collectLinks(docsSidebar('source/zh', 'docs'))) {
      expect(link.startsWith('/en/')).toBe(false)
    }
  })
})

describe('getFinalUrl 的语言段处理', () => {
  it('裸路径与 zh/ 前缀路径等价（root 语言缺省归一）', () => {
    expect(getFinalUrl('docs/02-guide/index.md')).toBe(getFinalUrl('zh/docs/02-guide/index.md'))
    expect(getFinalUrl('index.md')).toBe(getFinalUrl('zh/index.md'))
  })

  it('en/ 前缀路径产出 /en/ 路由', () => {
    expect(getFinalUrl('en/docs/02-guide/index.md').startsWith('en/')).toBe(true)
  })
})
