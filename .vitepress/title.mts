/**
 * 解析展示标题：frontmatter.shortTitle > frontmatter.title > 一级标题（# ...）。
 * shortTitle 用于卡片/侧边栏/面包屑/详情 H1 等展示场景，缺失时回退到 title（SEO 标题）。
 * 返回空串表示三者都缺失，由调用方回退到文件名/目录名（去掉排序前缀）。
 */
export function resolveTitle(fm: { title?: string; shortTitle?: string } | undefined, content: string): string {
  if (fm?.shortTitle) return fm.shortTitle
  if (fm?.title) return fm.title
  // 去掉 frontmatter 后取第一个一级标题
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const m = body.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : ''
}
