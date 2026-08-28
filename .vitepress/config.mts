import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "NextPilot Flight Control",
  description: "NextPilot Flight Control",
  lang: 'zh-CN',
  // 站点 favicon
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
  ],
  srcDir: 'source',
  outDir: 'build',
  // VitePress 2.0 的 publicDir 默认相对 srcDir（source/），这里指回仓库根目录的 public/
  vite: { publicDir: '../public' },
  lastUpdated: true,

  // 排除根目录的说明文件，避免被当作页面生成
  srcExclude: ['CLAUDE.md', 'README.md'],
  // frontmatter.permalink -> 固定访问路径（真实路由）
  // rewrites: buildRewrites(),

  // 通用主题配置（不区分语言）
  themeConfig: {
    logo: '/logo.png',
    siteTitle: false,
    search: { provider: 'local' },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nextpilot/nextpilot-flight-control' }
    ],

    footer: {
      message: '本文档采用 <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> 国际协议，开放共享、转载、修改、商用，但须保留署名来源',
      copyright: `Copyright © ${new Date().getFullYear()} NextPilot Development Team`,
    },
  },

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: '关于我们', link: '/aboutus/' },
          { text: '解决方案', link: '/solution/' },
          { text: '产品中心', link: '/product/' },
          { text: '用户手册', link: '/manual/' },
          { text: '开发指南', link: '/develop/' },
          { text: '博客', link: '/blog/' },
        ],
        // sidebar: { '/docs/': docsSidebar('') },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: '简体中文', link: '/' },
        ],
        // sidebar: { '/en/docs/': docsSidebar('en') },
      },
    },
  },

});
