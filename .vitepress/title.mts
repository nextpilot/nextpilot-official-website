/**
 * 解析标题：frontmatter.title > 一级标题（# ...）。
 * 返回空串表示两者都缺失，由调用方回退到文件名/目录名（去掉排序前缀）。
 */
export function resolveTitle(fmTitle: string | undefined, content: string): string {
  if (fmTitle) return fmTitle
  // 去掉 frontmatter 后取第一个一级标题
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const m = body.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : ''
}
