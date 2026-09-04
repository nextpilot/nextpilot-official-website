import { resolve } from 'node:path';
import { defineConfig } from 'vitepress';
import { docsSidebars } from './config/sidebar.mts';
import { headingTab } from './markdown/plugin-heading-tab.mts';
import { markdownTab } from './markdown/plugin-markdown-tab.mts';
import { markdownCard } from './markdown/plugin-markdown-card.mts';
import { rewriteLink } from './markdown/plugin-rewrite-link.mts';
import { redirectHead, canonicalHead, baiduAnalyticsHead, SITE_URL } from './config/head.mts';
import { buildRewrites } from './config/page.mts';

// 内容源目录（相对项目根），作为 srcDir 配置项并传给 docsSidebar
const srcDir = 'source';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // 站点基本信息：标题 / SEO 描述 / 默认语言
  title: 'NextPilot 让飞控更开放，让开发更高效，让设计更专注',
  description: 'NextPilot 致力于为大家提供一套简易、高效、可靠和开放的无人系统方案和产品，能够便捷的应用于教育、科研和工业等领域，让工程师专注于自己的擅长领域进行高效的开发。其中 NextPilot Flight Control 是一款基于 RT-Thread 实时操作系统、核心算法移植自 PX4 的国产先进自动驾驶仪，支持多旋翼、固定翼、垂起复合翼，目前在高等院校、科研院所、工业部门等拥有较为广泛的应用。',
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
    resolve: {
      alias: {
        '@root': resolve(process.cwd()),
      },
    },
  },
  // 开启页脚「最后更新于」时间戳（基于 Git 提交时间）
  lastUpdated: true,

  // 排除根目录的说明文件，避免被当作页面生成
  srcExclude: [
    'README.md',
    // 基本概念章节尚未完成，先排除编译
    'opensource/guide/01-concepts/**',
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
    config: (md) => {
      // 正文二级标题折叠为 tab（仅对 layout: product 页面生效）
      headingTab(md);
      // 通用 `::: tabs` 容器：`@tab 标题` 折叠为 tab
      markdownTab(md);
      // 卡片容器：`::: card [标题]`
      markdownCard(md);
      // 站内 .md 链接：物理路径（含排序前缀）自动改写为最终 URL
      rewriteLink(md);
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

  // 多语言：root = 简体中文（默认），en = English
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        outline: { label: '本页目录', level: [2, 4] },
        docFooter: { prev: '上一页', next: '下一页' },
        editLink: { text: '编辑此页' },
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
        sidebar: docsSidebars(srcDir, ['about', 'manual', 'opensource']),
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        editLink: { text: 'Edit this page' },
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
});
