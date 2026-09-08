import { describe, it, expect } from 'vitest'
import { isIndexLinkable } from '../.vitepress/config/page.mts'

describe('isIndexLinkable', () => {
  it('缺省 frontmatter 默认可链接（生成链接）', () => {
    expect(isIndexLinkable(undefined)).toBe(true)
    expect(isIndexLinkable(null)).toBe(true)
    expect(isIndexLinkable({})).toBe(true)
    expect(isIndexLinkable({ title: '栏目' })).toBe(true)
  })

  it("linkable 显式写为 'false' 时不可链接（不生成链接）", () => {
    expect(isIndexLinkable({ linkable: 'false' })).toBe(false)
  })

  it("linkable 写为 'true' 时仍可链接", () => {
    expect(isIndexLinkable({ linkable: 'true' })).toBe(true)
  })
})
