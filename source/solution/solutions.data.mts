import { createContentLoader } from 'vitepress'

export default createContentLoader('solution/*.md', {
  transform(data) {
    return data
      .filter((item) => item.url !== '/solution/')
      .sort((a, b) => (a.frontmatter.order ?? 999) - (b.frontmatter.order ?? 999))
      .map((item) => ({
        title: item.frontmatter.title || '',
        cover: item.frontmatter.cover || '',
        summary: item.frontmatter.summary || '',
        url: item.url,
      }))
  },
})
