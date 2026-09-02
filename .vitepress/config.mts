import { defineConfig } from 'vitepress'
import { docsSidebar } from './config/sidebar.mts'
import { headingTab } from './markdown/plugin-heading-tab.mts'
import { markdownTab } from './markdown/plugin-markdown-tab.mts'
import { redirectHead, canonicalHead, baiduAnalyticsHead, SITE_URL } from './config/metahead.mts'

// 内容源目录（相对项目根），作为 srcDir 配置项并传给 docsSidebar
const srcDir = 'source'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // 站点基本信息：标题 / SEO 描述 / 默认语言
  title: 'NextPilot Flight Control',
  description: 'NextPilot 国产开源先进自动驾驶仪（飞控系统），基于 RT-Thread 实时操作系统、核心算法移植自 PX4，支持多旋翼、固定翼、垂起复合翼，面向教育、科研与工业应用',
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
  // 按页注入 canonical（见 config/metahead.mts，与 sitemap 共用 SITE_URL）
  transformHead: canonicalHead,
  // 内容源目录与构建输出目录
  srcDir,
  outDir: 'build',
  // VitePress 2.0 的 publicDir 默认相对 srcDir（source/），这里指回仓库根目录的 public/
  vite: { publicDir: '../public' },
  // 开启页脚「最后更新于」时间戳（基于 Git 提交时间）
  lastUpdated: true,

  // 排除根目录的说明文件，避免被当作页面生成
  srcExclude: [
    'README.md',
    // 基本概念章节尚未完成，先排除编译
    'manual/01-基本概念/**',
  ],

  // 下载页脚本链接指向 .bat 文件，VitePress 无法识别该扩展名为静态资源，故忽略死链检查
  ignoreDeadLinks: ['/scripts/start-qemu.bat', '/scripts/extract-sd.bat'],

  // frontmatter.permalink -> 固定访问路径（真实路由）
  // rewrites: buildRewrites(),

  // 数学公式支持（LaTeX，通过 markdown-it-mathjax3）
  markdown: {
    math: true,
    // 图片懒加载：为 <img> 添加 loading="lazy"
    image: { lazyLoad: true },
    // 代码块显示行号
    lineNumbers: true,
    config: (md) => {
      // 正文二级标题折叠为 tab（仅对 layout: product 页面生效）
      headingTab(md)
      // 通用 `::: tabs` 容器：`@tab 标题` 折叠为 tab
      markdownTab(md)
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
    socialLinks: [{ icon: 'github', link: 'https://github.com/nextpilot/nextpilot-official-website' }],
  },

  // 多语言：root = 简体中文（默认），en = English
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        outline: { label: '本页目录', level: [2, 4] },
        docFooter: { prev: '上一页', next: '下一页' },
        lastUpdated: { text: '最后更新于' },
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '外观',
        lightModeSwitchTitle: '切换到浅色主题',
        darkModeSwitchTitle: '切换到深色主题',
        langMenuLabel: '切换语言',
        skipToContentLabel: '跳转到内容',
        notFound: {
          title: '页面未找到',
          quote: '抱歉，您访问的页面不存在或已被移除。',
          linkLabel: '返回首页',
          linkText: '回到首页',
        },
        footer: {
          message: '本文档采用 <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> 国际协议，开放共享、转载、修改、商用，但须保留署名来源',
          copyright: `Copyright © ${new Date().getFullYear()} NextPilot Development Team`,
        },
        nav: [
          { text: '首页', link: '/' },
          { text: '关于我们', link: '/about/' },
          // { text: '新闻资讯', link: '/news/' },
          { text: '解决方案', link: '/solution/' },
          { text: '产品中心', link: '/product/' },
          { text: '用户文档', link: '/manual/' },
          { text: '开源项目', link: '/opensource/' },
          { text: '资料下载', link: '/download/' },
          { text: '技术博客', link: '/blog/' },
        ],
        sidebar: {
          '/about/': docsSidebar(srcDir, 'about'),
          '/manual/': docsSidebar(srcDir, 'manual'),
          '/opensource/': docsSidebar(srcDir, 'opensource'),
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        footer: {
          message:
            'This documentation is licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>. You are free to share, adapt, and use it commercially, provided you give appropriate credit.',
          copyright: `Copyright © ${new Date().getFullYear()} NextPilot Development Team`,
        },
        nav: [{ text: 'Home', link: '/en/' }],
        // sidebar: { '/en/docs/': docsSidebar('en') },
      },
    },
  },
})
