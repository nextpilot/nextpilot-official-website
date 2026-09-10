import { describe, it, expect } from 'vitest'
import { docsNavbar } from '../.vitepress/config/navbar.mts'

/** 递归收集导航树内所有 link（含自定义字段 sectionLink） */
function collectLinks(items: any[], acc: string[] = []): string[] {
  for (const item of items) {
    if (item.link) acc.push(item.link)
    if (item.sectionLink) acc.push(item.sectionLink)
    if (item.items) collectLinks(item.items, acc)
  }
  return acc
}

describe('docsNavbar（扫描 source/zh）', () => {
  it('生成非空中文导航', () => {
    const items = docsNavbar('source/zh')
    expect(items.length).toBeGreaterThan(0)
  })

  it('所有链接都不含 zh/ 语言段（rewrite 后该段不可见）', () => {
    for (const link of collectLinks(docsNavbar('source/zh'))) {
      expect(link).not.toContain('/zh/')
      expect(link).not.toBe('/zh')
    }
  })
})
