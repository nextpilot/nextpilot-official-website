import { describe, it, expect } from 'vitest'
import { docsSidebar } from '../.vitepress/config/sidebar.mts'

describe('docsSidebar', () => {
  it('为 about 栏目生成非空侧边栏', () => {
    const items = docsSidebar('source', 'about')
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)
  })

  it('每个条目都有 text 和 link', () => {
    for (const item of docsSidebar('source', 'about')) {
      expect(item.text).toBeTruthy()
      expect(item.link).toBeTruthy()
    }
  })
})
