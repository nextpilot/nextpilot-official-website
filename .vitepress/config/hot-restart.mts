import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'

/** 统一为正斜杠路径，便于 Windows / POSIX 比较 */
function normalize(path: string): string {
  return path.replace(/\\/g, '/')
}

/** 递归收集目录下所有 .md 文件的绝对路径 */
function collectMdFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      collectMdFiles(full, acc)
    } else if (name.endsWith('.md')) {
      acc.push(full)
    }
  }
  return acc
}

/**
 * 影响导航/侧边栏的内容签名：整个 frontmatter 块（title / shortTitle / order /
 * draft / permalink 等任一字段变化都会改变）+ 一级标题（标题兜底来源）。
 * 正文内容变化不影响该签名，故只改正文不会触发重启。
 */
function navSignature(filePath: string): string {
  const raw = readFileSync(filePath, 'utf-8')
  const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
  const h1 = raw.match(/^#\s+(.+)$/m)?.[1] ?? ''
  return frontmatter + '\n#h1:' + h1
}

/**
 * 开发环境热重启：导航/侧边栏结构或栏目标题、排序变更后自动重启 dev server。
 *
 * 导航（nav）与侧边栏（sidebar）在 dev server 启动时由 docsNavbar() / docsSidebars()
 * 扫描目录生成一次，VitePress 原生 HMR 只会热更新页面内容，不会重建 themeConfig.nav。
 * 此插件监听 source/ 下影响导航/侧边栏的变更并触发 VitePress 内置的重启（等价于终端按 r）：
 *
 * - 新增/删除任意目录或 .md 文件（新栏目、新页面、删除；文件/文件夹改名会报 unlink+add，同样触发）
 * - 修改任意 md 的 frontmatter（title / shortTitle / permalink / order / draft 等任一字段）或一级标题
 *
 * 编辑页面正文（不含 frontmatter / 一级标题的变化）走原生 HMR，不重启；仅 dev 生效。
 */
export function hotRestartPlugin(srcDir: string): Plugin {
  let timer: ReturnType<typeof setTimeout> | undefined

  return {
    name: 'nextpilot-hot-restart',
    apply: 'serve',
    configureServer(server) {
      const sourceRoot = normalize(resolve(process.cwd(), srcDir))
      // navbar.mts 是 config.mts 的依赖（configDeps），其变更会触发 VitePress 重启
      const configDep = normalize(resolve(process.cwd(), '.vitepress/config/navbar.mts'))
      if (!existsSync(configDep)) return

      // 启动时记录所有 md 的导航/侧边栏签名，作为后续变更对比基线
      const signatures = new Map<string, string>()
      for (const file of collectMdFiles(resolve(process.cwd(), srcDir))) {
        try {
          signatures.set(normalize(file), navSignature(file))
        } catch {
          /* 忽略读取失败 */
        }
      }

      const scheduleRestart = () => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          server.watcher.emit('change', configDep)
        }, 250)
      }

      const underSource = (file: string) => normalize(file).startsWith(sourceRoot + '/')

      // 新增/删除目录、新增/删除任意 md 文件：影响导航或侧边栏结构
      server.watcher.on('addDir', (p) => underSource(p) && scheduleRestart())
      server.watcher.on('unlinkDir', (p) => underSource(p) && scheduleRestart())
      server.watcher.on('add', (p) => underSource(p) && p.endsWith('.md') && scheduleRestart())
      server.watcher.on('unlink', (p) => underSource(p) && p.endsWith('.md') && scheduleRestart())

      // 修改 md：仅当标题/排序/草稿等导航字段变化时重启（改正文不重启）
      server.watcher.on('change', (p) => {
        const path = normalize(p)
        if (!underSource(path) || !path.endsWith('.md')) return
        let sig: string
        try {
          sig = navSignature(p)
        } catch {
          return
        }
        const prev = signatures.get(path)
        signatures.set(path, sig)
        if (prev !== undefined && prev !== sig) scheduleRestart()
      })
    },
  }
}
