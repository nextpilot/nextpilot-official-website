// URL 路径去排序前缀：文件名/目录名在文件系统中带 NN- 前缀保证条理，
// 但最终 URL 需要去掉前缀。与 sidebar.mts 的 titleFromName 共用同一规则。
// VitePress rewrites 的 id 是相对 srcDir 的源路径（含 .md），返回含 .md 的目标路径。

/** 去掉单个段落的前导数字排序前缀（如 `03-quickstart` → `quickstart`、`10-gnss-config` → `gnss-config`） */
export function stripSegmentPrefix(name: string): string {
  return name.replace(/^\d+-/, '')
}

/** 对路径的每个 `/` 分隔段落去掉前缀 */
export function stripPrefixes(path: string): string {
  return path.split('/').map(stripSegmentPrefix).join('/')
}

/** VitePress `rewrites` 函数形式：源路径（含 .md）→ 去前缀的目标路径（含 .md） */
export function buildRewrites(id: string): string {
  return stripPrefixes(id)
}
