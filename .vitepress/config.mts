import { defineConfig } from 'vitepress'
import { docsSidebar } from './sidebar.mts'
import { productHeadingTabs } from './markdown/product-heading-tabs.mts'
import { tabsGroup } from './markdown/tabs-group.mts'
import { redirectHead, canonicalHead, SITE_URL } from './head.mts'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'NextPilot Flight Control',
  description: 'NextPilot Flight Control',
  lang: 'zh-CN',
  // 站点 favicon
  head: [['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }], ...redirectHead],
  transformHead: canonicalHead,
  srcDir: 'source',
  outDir: 'build',
  // VitePress 2.0 的 publicDir 默认相对 srcDir（source/），这里指回仓库根目录的 public/
  vite: { publicDir: '../public' },
  lastUpdated: true,

  // 排除根目录的说明文件，避免被当作页面生成
  srcExclude: ['README.md'],

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
      productHeadingTabs(md)
      // 通用 `::: tabs` 容器：`=== 标题` 折叠为 tab
      tabsGroup(md)
    },
  },

  // 站点地图：仅当设置了 SITE_HOST 时生成
  ...(SITE_URL ? { sitemap: { hostname: SITE_URL } } : {}),

  // 通用主题配置（不区分语言）
  themeConfig: {
    logo: '/logo.png',
    siteTitle: false,
    search: { provider: 'local' },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nextpilot/nextpilot-flight-control' },
    ],
  },

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        outline: { label: '本页目录' },
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
          message:
            '本文档采用 <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> 国际协议，开放共享、转载、修改、商用，但须保留署名来源',
          copyright: `Copyright © ${new Date().getFullYear()} NextPilot Development Team`,
        },
        nav: [
          { text: '首页', link: '/' },
          { text: '关于我们', link: '/aboutus/' },
          // { text: '新闻资讯', link: '/news/' },
          { text: '解决方案', link: '/solution/' },
          { text: '产品中心', link: '/product/' },
          {
            text: '文档中心',
            items: [
              { text: '用户手册', link: '/manual/' },
              { text: '开发指南', link: '/develop/' },
              { text: '社区支持', link: '/community/' },
            ],
          },
          { text: '资料下载', link: '/download/' },
          { text: '技术博客', link: '/blog/' },
        ],
        sidebar: {
          '/aboutus/': docsSidebar('aboutus'),
          '/manual/': docsSidebar('manual'),
          '/develop/': docsSidebar('develop'),
          '/community/': docsSidebar('community'),
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
