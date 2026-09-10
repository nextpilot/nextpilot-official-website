import { describe, it, expect } from 'vitest'
import { getFileUrl, getFinalUrl, isIndexLinkable } from '../.vitepress/config/page.mts'

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

describe('多语言目录（source/zh、source/en）路由归一', () => {
  it('zh 根 index：URL 为空、文件路径为 index.md（首页仍在 /）', () => {
    expect(getFinalUrl('zh/index.md')).toBe('')
    expect(getFileUrl('zh/index.md')).toBe('index.md')
  })

  it('裸路径（navbar/sidebar 扫描 source/zh 后的入参）按 zh 处理', () => {
    expect(getFileUrl('about/index.md')).toBe('about/index.md')
    expect(getFinalUrl('about/index.md')).toBe('about/')
  })

  it('zh 页面剥掉语言段并去除 NN- 排序前缀', () => {
    expect(getFileUrl('zh/docs/02-guide/03-quickstart/01-preparation.md')).toBe('docs/guide/quickstart/preparation.md')
  })

  it('en 根 index：URL 为 en/、文件路径为 en/index.md（英文站在 /en/）', () => {
    expect(getFinalUrl('en/index.md')).toBe('en/')
    expect(getFileUrl('en/index.md')).toBe('en/index.md')
  })

  it('en 普通页与目录 index 保留 en/ 前缀', () => {
    expect(getFileUrl('en/foo.md')).toBe('en/foo.md')
    expect(getFileUrl('en/guide/index.md')).toBe('en/guide/index.md')
  })
})
