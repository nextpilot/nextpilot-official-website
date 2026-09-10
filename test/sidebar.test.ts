import { describe, it, expect } from 'vitest'
import { docsSidebar } from '../.vitepress/config/sidebar.mts'

describe('docsSidebar', () => {
  it('为 about 栏目生成非空侧边栏', () => {
    const items = docsSidebar('source/zh', 'about')
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)
  })

  it('每个条目都有 text 和 link', () => {
    for (const item of docsSidebar('source/zh', 'about')) {
      expect(item.text).toBeTruthy()
      expect(item.link).toBeTruthy()
    }
  })

  it('docs 栏目合并 manual/opensource 后顶层为四个子栏目分组', () => {
    const items = docsSidebar('source/zh', 'docs')
    expect(items.length).toBe(4)
    expect(items.map((i) => i.text)).toEqual(['产品手册', '使用教程', '开发指南', '社区支持'])
    // 所有链接都在 /docs/ 下，且不含排序前缀
    for (const item of items) {
      expect(item.link || '').toMatch(/^\/docs\/(manual|guide|develop|community)\/$/)
      expect(item.link || '').not.toMatch(/\d\d-/)
    }
  })
})
