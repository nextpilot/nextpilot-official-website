import { resolve } from 'node:path'
import { defineConfig } from 'vitepress'
import { buildLocales } from './config/locales.mts'
import { hotRestartPlugin } from './config/hot-restart.mts'
import { headingTab } from './markdown/plugin-heading-tab.mts'
import { markdownTab } from './markdown/plugin-markdown-tab.mts'
import { markdownCard } from './markdown/plugin-markdown-card.mts'
import { rewriteLink } from './markdown/plugin-rewrite-link.mts'
import { redirectHead, canonicalHead, baiduAnalyticsHead, SITE_URL } from './config/head.mts'
import { buildRewrites } from './config/page.mts'

// 内容源目录（相对项目根），作为 srcDir 配置项；root 语言（中文）内容在其下 zh/ 子目录（见 config/locales.mts）
const srcDir = 'source'

// 多语言配置（root 简体中文 / en English）：导航、侧边栏、themeConfig 与 markdown 本地化
const locales = buildLocales(srcDir)

// 各语言构建期 markdown 本地化（自定义容器标题等），同步到 markdown.locales。
// 兼容 VitePress 2.0.0-alpha.19：本地搜索插件（vitepress:local-search）会用「未合并 locales」的原始
// markdown 选项最先创建 markdown 渲染器，而 createMarkdownRenderer 是模块级单例（if (md) return md），
// 导致 locales.<index>.markdown 里的容器标题在正式构建时被忽略、回退英文默认标题；显式写进 markdown.locales
// 可让这个单例渲染器也按语言取标题。英文（en）未覆盖容器标题，沿用默认英文。
const markdownLocales = Object.entries(locales).reduce<Record<string, NonNullable<(typeof locales)[string]['markdown']>>>((acc, [key, locale]) => {
  if (locale.markdown) acc[key] = locale.markdown
  return acc
}, {})

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // 站点基本信息：标题 / SEO 描述 / 默认语言
  title: 'NextPilot 让飞控更开放，让开发更高效，让设计更专注',
  description:
    'NextPilot 致力于为大家提供一套简易、高效、可靠和开放的无人系统方案和产品，能够便捷的应用于教育、科研和工业等领域，让工程师专注于自己的擅长领域进行高效的开发。其中 NextPilot Flight Control 是一款基于 RT-Thread 实时操作系统、核心算法移植自 PX4 的国产先进自动驾驶仪，支持多旋翼、固定翼、垂起复合翼，目前在高等院校、科研院所、工业部门等拥有较为广泛的应用。',
  lang: 'zh-CN',
  // 全局 <head>：favicon + SEO meta（keywords / author）+ 客户端跳转脚本
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    [
      'meta',
      {
        name: 'keywords',
        content: 'NextPilot,飞控,自动驾驶仪,无人机,开源飞控,多旋翼,固定翼,垂起复合翼,RT-Thread,PX4,Pixhawk,ArduPilot,QGroundControl,MAVLink,UAV,autopilot,flight controller',
      },
    ],
    ['meta', { name: 'author', content: 'NextPilot Development Team' }],
    ...redirectHead,
    ...baiduAnalyticsHead,
  ],
  // 按页注入 canonical（见 config/head.mts，与 sitemap 共用 SITE_URL）
  transformHead: canonicalHead,
  // 内容源目录与构建输出目录
  srcDir,
  outDir: 'build',
  // VitePress 2.0 的 publicDir 默认相对 srcDir（source/），这里指回仓库根目录的 public/
  vite: {
    publicDir: '../public',
    plugins: [
      // 仅 dev：新增/删除栏目目录或 index.md 时自动重启，让导航结构热更新（见 config/hot-restart.mts）
      hotRestartPlugin(srcDir),
    ],
    resolve: {
      alias: {
        '@root': resolve(process.cwd()),
      },
    },
  },
  // 开启页脚「最后更新于」时间戳（基于 Git 提交时间）
  lastUpdated: true,

  // 排除根目录的说明文件，避免被当作页面生成；模式相对 srcDir（source/）匹配物理路径
  srcExclude: [
    'README.md',
    // 基本概念章节尚未完成，先排除编译（中文内容物理位于 zh/ 下）
    'zh/opensource/guide/01-concepts/**',
  ],

  // 下载页脚本链接指向 .bat 文件，VitePress 无法识别该扩展名为静态资源，故忽略死链检查
  ignoreDeadLinks: ['/assets/scripts/start-qemu.bat', '/assets/scripts/extract-sd.bat'],

  // 去掉 URL 中的排序前缀（见 config/page.mts）
  rewrites: buildRewrites,

  // 数学公式支持（LaTeX，通过 markdown-it-mathjax3）
  markdown: {
    math: true,
    // 代码块显示行号
    lineNumbers: true,
    // 各语言容器标题等本地化（兼容 VitePress 2.0.0-alpha.19 渲染器单例，见文件顶部注释）
    locales: markdownLocales,
    config: (md) => {
      // 正文二级标题折叠为 tab（仅对 layout: product 页面生效）
      headingTab(md)
      // 通用 `::: tabs` 容器：`@tab 标题` 折叠为 tab
      markdownTab(md)
      // 卡片容器：`::: card [标题]`
      markdownCard(md)
      // 站内 .md 链接：物理路径（含排序前缀）自动改写为最终 URL
      rewriteLink(md)
    },
  },

  // 站点地图：始终指向权威域名（nextpilot.org）
  sitemap: { hostname: SITE_URL },

  // 通用主题配置（不区分语言）
  themeConfig: {
    // 顶部导航 Logo；siteTitle: false 表示不额外显示站点文字标题
    logo: '/logo.png',
    siteTitle: false,
    // 本地全文搜索
    search: { provider: 'local' },
    // 右上角社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/nextpilot/nextpilot-official-website' },
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.445h8.296Z"/></svg>',
        },
        link: 'https://gitee.com/nextpilot/nextpilot-official-website',
        ariaLabel: 'Gitee',
      },
    ],
    // 页脚「编辑此页」链接；:path 为相对 srcDir（source/）的源文件路径，故补上 source/ 前缀
    editLink: {
      pattern: 'https://github.com/nextpilot/nextpilot-official-website/edit/master/source/:path',
    },
  },

  // 多语言：root = 简体中文（默认），en = English（定义见 config/locales.mts）
  locales,
})
