import type { UserConfig } from 'vitepress'
import { docsNavbar } from './navbar.mts'
import { docsSidebars } from './sidebar.mts'

/** 中文（root）站点需要自动侧边栏的栏目 */
const sidebarSections = ['about', 'manual', 'opensource']

/**
 * 构建多语言配置：root = 简体中文（默认），en = English。
 *
 * 中文导航/侧边栏由 docsNavbar() / docsSidebars() 扫描 source 目录自动生成；
 * 非 root 的语言键（如 en）即对应语言内容目录，扫描导航时自动跳过。
 * 新增语言时在此添加一个键即可，无需改动 navbar。
 */
export function buildLocales(srcDir: string): NonNullable<UserConfig['locales']> {
  const locales = {
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
          message:
            '本文档采用 <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> 国际协议，开放共享、转载、修改、商用，但须保留署名来源',
          copyright: `Copyright © ${new Date().getFullYear()} NextPilot Development Team`,
        },
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
  } satisfies UserConfig['locales']

  // 其它语言站点的目录名（locales 中非 root 的键，如 en），中文导航扫描时自动跳过
  const localeDirs = Object.keys(locales).filter((key) => key !== 'root')

  // 中文导航与侧边栏：由 source 目录自动扫描生成，新增顶级/二级栏目无需修改配置
  const rootThemeConfig = locales.root.themeConfig!
  rootThemeConfig.nav = [{ text: '首页', link: '/' }, ...docsNavbar(srcDir, localeDirs)]
  rootThemeConfig.sidebar = docsSidebars(srcDir, sidebarSections)

  return locales
}
