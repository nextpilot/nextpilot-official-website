# CLAUDE.md

本文件为 Claude Code 提供本仓库的工作指引。

## 1. 项目概览

本项目是 **NextPilot 官方网站**，使用 [VitePress](https://vitepress.dev/) 构建。旧版站点基于 MkDocs，地址为 <https://docs.nextpilot.org>；当前项目是其 VitePress 重构版。

NextPilot（`nextpilot-flight-control`）是一款国产开源先进自动驾驶仪（飞控系统），代码仓库托管于 [GitHub](https://github.com/nextpilot) 和 [Gitee](https://gitee.com/nextpilot)：

- 基于 **RT-Thread** 实时操作系统，核心算法移植自 **PX4**
- 面向教育、研究和工业领域，采用 uORB / PARAM / AIRFRAME 等可扩展架构
- 支持多旋翼、固定翼、垂起复合翼等机型，支持 MIL / SIL / HIL / SIH 仿真

## 2. 当前状态

以下内容描述的是当前仓库的真实实现状态，与后文的规范约定分开说明。

已完成的核心工作：

- VitePress 基础配置
- `about` / `manual` / `opensource` 自动侧边栏生成
- 产品列表页（`createContentLoader` + `CatalogLayout` 布局）
- URL 排序前缀去除：`buildRewrites()`（`rewrites` 已启用，URL 不含 `NN-` 前缀）
- `permalink` 路由重写（绝对/相对地址，侧边栏与正文内链统一解析）

待完成或待完善：

- 文章列表页：`news` / `blog`
- `yyyymmdd` 日期前缀倒序排列（当前按数字升序）

## 3. 环境与技术栈

- VitePress 2.0（当前版本 `2.0.0-alpha.19`，Vite 8）
- Vue 3 自定义主题组件
- Node.js v22
- **pnpm**（本机 v11.8.0；npm 10.9.8 也可用）
- 内容以 Markdown 为主，构建产物为静态站点

```bash
pnpm install
pnpm docs:dev  # 对应 package.json 中的 vitepress dev
pnpm docs:build  # 对应 package.json 中的 vitepress build
pnpm docs:preview  # 对应 package.json 中的 vitepress preview
```

## 4. 仓库结构

采用 VitePress 默认布局，`srcDir` 指向 `source/`，`outDir` 指向 `build/`。

```text
nextpilot-official-website/
├── .vitepress/                     # VitePress 站点配置与主题扩展
│   ├── config.mts                 # 站点主配置：nav / sidebar / locales / rewrites
│   ├── config/                    # 配置辅助模块（sidebar / head / page）
│   ├── markdown/                  # markdown-it 插件
│   ├── theme/                    # 自定义主题、组件与全局样式
│   └── ...                       # 其余 VitePress 相关文件
├── source/                        # 内容源目录，Markdown 页面都放在这里
│   ├── index.md                  # 首页
│   ├── about/                    # 关于我们栏目
│   ├── solution/                 # 解决方案栏目
│   ├── product/                  # 产品中心
│   │   ├── aircraft/             # 无人机平台
│   │   ├── autopilot/            # 飞行控制
│   │   ├── datalink/             # 通信链路
│   │   ├── navigator/            # 导航传感
│   │   └── peripheral/           # 其它外设
│   ├── manual/                   # 用户手册（产品导向）
│   │   ├── aircraft/             # 无人机平台
│   │   ├── autopilot/            # 飞行控制
│   │   ├── datalink/             # 通信链路
│   │   ├── navigator/            # 导航传感
│   │   └── peripheral/           # 其它外设
│   ├── opensource/               # 开源项目
│   │   ├── community/            # 社区支持
│   │   ├── develop/              # 开发指南
│   │   └── guide/                # 用户手册（开源文档）
│   ├── discovery/                # 发现/展示栏目（占位待建）
│   ├── news/                     # 新闻资讯
│   ├── download/                 # 资源下载
│   ├── blog/                     # 博客
│   └── en/                       # 英文站内容目录
├── public/                        # 静态资源目录，打包后直接输出
│   ├── assets/                   # 静态资源（images/ files/ scripts/）
│   ├── CNAME                     # 域名配置文件
│   ├── favicon.png               # 站点图标
│   └── logo.png                  # Logo
├── build/                         # VitePress 构建产物，不应提交到仓库
├── package.json                   # 项目脚本与依赖声明
├── pnpm-lock.yaml                 # pnpm 锁文件
├── .gitignore                     # Git 忽略规则
├── LICENSE                        # 项目许可证
├── README.md                      # 项目说明
├── CLAUDE.md                      # AI/维护说明文档
└── ...                            # 其他配置文件或工程目录
```

## 5. 文件路径与命名

以下为维护与内容创作的统一约定，适用于新增页面、目录结构和图片命名。

- 所有 `文件夹` 统一叫为栏目（之前有称为分类、分组等），顶级文件夹为顶级栏目，下级文件夹为子栏目
- 所有 `markdown 文件` 统一叫为页面（之前有称为产品、文章等）
- 目录格式推荐：`<column>/<xx-subcolumn>/<...>/<yy-markdown.md>`
  - `<column>` 为栏目，`<subcolumn>` 为子栏目，目录层级建议不超过 5 级
  - `xx` 是`两位整数`排序前缀，通常用于时间不敏感栏目（比如 product、solution 等）
  - `yyyymmdd` 是`日期格式`排序前缀，用于敏感类型栏目（比如 blog、news 等）
- 文件和目录名一律小写，且只允许：数字、小写字母、横杠（优先）、下划线（谨慎）、小数点（仅用于版本号），不允许中文或特殊字符
- 图片统一放在 `public/assets/images/<栏目>/`，用绝对路径 `/assets/images/...` 引用（正文 `<img>` 与 `frontmatter` 的 `cover`/`gallery` 均如此）
- 图片文件名应使用有意义的英文小写 slug，去掉自动生成的时间戳前缀（如 `image-20260623150217001.png` → `sim-main.png`）
- 下载类文件：固件 `.bin` 放 `public/assets/files/`、脚本 `.bat` 放 `public/assets/scripts/`，均用绝对路径 `/assets/files/...`、`/assets/scripts/...` 引用

## 6. 名称、排序和路由

以下的名称、排序和路由主要用于侧边栏、面包屑导航等。

> **核心原则：`permalink` 只决定 URL（链接），不改变栏目/分类归属；侧边栏、面包屑等导航一律按物理路径（源文件目录）划分栏目。**
>
> **link ≠ slug**：栏目/页面才有 `link`（URL 路径），分类/标签才有 `slug`（从名称 slugify 的标识），两者是不同实体的不同字段，不互相替代。

### 6.1 栏目

栏目只有两个身份字段：**name（名称）** 与 **link（链接）**，另加排序。栏目用于页面组织、不做筛选，因此**无需 slug**，直接用 link 访问。

- 栏目的名称，获取优先级：`index.md.frontmatter.shortTitle` > `index.md.frontmatter.title` > `index.md.一级标题` > `文件夹名（除去排序前缀）`
- 栏目的排序，获取优先级：`index.md.frontmatter.order` > `栏目文件夹的排序前缀`，且按照从小到大排序
- 栏目的链接，获取 `index.md.frontmatter.permalink` > `栏目文件夹路由（去除排序前缀）`；如果 `index.md.frontmatter.permalink` 是相对地址，则需要根据上级栏目的链接进行拼接。`index.md` 自身文件名恒为 `index`（落在 `<栏目路由>/index.html`），其 `permalink` 只决定栏目路由
- 栏目的链接开关：`index.md.frontmatter.linkable` 写为 `false` 时，该栏目/子栏目首页不作为可点击入口——顶部导航直接跳过不生成该条目（侧边栏分组头、面包屑仍展示标题但不可点击），缺省默认可链接；这只影响自动导航，不改变栏目路由与页面本身（详见第 8 节 frontmatter 约定）

### 6.2 页面

页面有 **name（名称）** 与 **link（链接）** 两个身份字段，另加排序、所属栏目、分类与标签。

- 页面的名称，获取优先级：`frontmatter.shortTitle` > `frontmatter.title` > `一级标题` > `页面文件名（除去排序前缀）`，优先级从高到低。
- 页面的排序，获取优先级：`frontmatter.order` > `页面文件的排序前缀`，`xx` 按照从小到大排序，`yyyymmdd` 是页面创建日期，按照倒序排列（倒序当前未实现，待办）
- 页面的链接，获取优先级：`frontmatter.permalink` > `页面文件的物理路由`，物理路由需要去掉排序前缀；如果 `frontmatter.permalink` 是相对地址，则需要根据上级栏目的链接进行拼接
- 页面的栏目（所属栏目）：由页面所在的物理目录决定，页面只属于一个栏目；列表展示时按栏目分组。栏目无 slug，直接用 link 访问
- 页面的分类（`category`，独立属性，仅用于筛选、不决定栏目归属；不同栏目下的页面可拥有同一个分类），借鉴 Hexo：**名称是唯一真相源，slug 由名称 slugify 推导**，不手写 slug：
  - 分类名（name）：`frontmatter.category` > 子栏目名（`子栏目 index.md` 的 `shortTitle` > `title` > 一级标题 > 目录名去前缀）> `uncategorized`
  - 分类 slug：`slugify(分类名)`，可经全局 `categoryMap` 覆盖（改 slug 不改名）
- 页面的标签（`tags`，不参与分类筛选）：标签名 `frontmatter.tags`；标签 slug `slugify(标签名)`，可经全局 `tagMap` 覆盖

## 7. 栏目设计与内容模型

本节按统一模板描述各栏目，以保证颗粒度一致，并明确当前内容模型与后续扩展边界：

- 栏目定位与页面类型
- 目录结构与分组方式
- 页面布局与展示规则
- 关键约束与待办状态

### 7.1 关于我们 / 解决方案

- 栏目定位：`about` 与 `solution` 都属于静态页面栏目，分别用于品牌介绍与解决方案概览。
- 目录规则：均采用扁平结构：`<栏目>/<xx-page.md>`，每个页面对应一个单独文档，不做深层嵌套。
- 约束条件：`about` 使用自动 sidebar；`solution` 列表页使用 `layout: solution`（`.vitepress/theme/SolutionLayout.vue`），布局自动读取同名数据加载器 `.vitepress/theme/SolutionLayout.data.mts` 渲染方案卡片网格，不显示侧边栏。

### 7.2 产品中心

- 栏目定位：`product` 是产品展示栏目，采用列表页 + 详情页结构。
- 目录规则：`product/xx-subcolumn/yy-markdown.md`，其中产品子栏目 `subcolumn` 包括 `aircraft`、`autopilot`、`datalink`、`navigator`、`peripheral`。
- 过滤规则：必须过滤 `index.md` 和 `draft: true`，并支持按分类筛选与全文搜索，分类筛选不能使用 `tags`。
- 约束条件：卡片展示依赖 `frontmatter` 中 `title / cover / summary / price / tags` 等，未填写字段不显示。
- 列表布局：产品列表页（`product/index.md`）使用 `layout: catalog`（`.vitepress/theme/CatalogLayout.vue`），布局自动读取同名数据加载器 `.vitepress/theme/CatalogLayout.data.mts` 并按当前栏目过滤后渲染产品卡片网格（搜索 + 分类筛选 + 卡片网格内联在布局中）；`product/<subcolumn>/index.md` 若同样声明 `layout: catalog`，则自动只展示子栏目中的产品。加载器以 `frontmatter.layout === 'product'` 识别产品详情页，不绑定文件夹。
- 详情布局：产品详情页使用 `layout: product` 自定义布局（`.vitepress/theme/ProductLayout.vue`），左侧图库 + 右侧摘要（标题 / 简介 / 价格 / CTA），下方渲染详细正文；正文不写首行 `# 标题`（标题由 `frontmatter.title` 在布局中渲染）。
- 正文 tabs：正文中每个二级标题（`##`）会自动折叠为一个 tab（由 `.vitepress/markdown/plugin-heading-tab.mts` 插件在构建期生成，对声明 `layout: product` 的页面生效）；少于两个二级标题时不生成 tab。

### 7.3 用户手册 / 开发指南 / 社区支持

- 栏目定位：顶级 `manual`（产品导向）与顶级 `opensource`（其下含 `community` / `develop` / `guide` 子栏目）都属于 `docs` 类型，主要展示文档内容和知识库。
- 目录规则：`manual/<xx-subcolumn>/<...>/<yy-markdown.md>`，子栏目下可再嵌套下级栏目（层级建议不超过 5 级）；`index.md` 用作各级栏目首页，并提供该栏目所需的 `frontmatter`。
- 约束条件：侧边栏按物理目录**递归**生成分组（`docsSidebar()`），左侧自动生成 sidebar，右侧显示 TOC。各级 `index.md` 不单独列为文档条目，而是作为所在分组的标题：`linkable` 不为 false 时分组头可点击指向栏目首页，为 false 时仅作分组标签。下级栏目若暂时只有 `index.md`（尚无文档页），仍会进入侧边栏——可链接时退化为单个链接条目，不可链接时为仅标题的空分组；不含任何 `.md` 的纯资源目录（如 `imgs/`）跳过。

### 7.4 新闻资讯 / 博客

- 栏目定位：`news` 与 `blog` 属于 `post` 类型，用于发布文章与更新信息。
- 目录规则：`news/<xx-subcolumn>/<yyyymmdd-markdown.md>`，`index.md` 仅用作子栏目首页，并提供子栏目所需的 `frontmatter`。
- 展示规则：文章列表页可提取 `title / cover / summary / tags / date / author` 等字段；列表页必须过滤 `index.md` 和 `draft: true`。
- 约束条件：`news` 当前仍为待建栏目，不接入 nav，也不实现列表页；`blog` 为正式栏目，支持分类和 tags 过滤。

### 7.5 其他栏目

- `/discovery/`：图片/视频展示栏目，暂作为待建占位页，不接入 nav，不实现展示墙。
- `/download/`：资料下载栏目，当前已有导航入口，但内容模型尚待确定。
- 约束：新增内容前应先确认栏目定位，再统一遵循命名、排序、frontmatter 和站内链接规范。

## 8. Frontmatter 约定

示例：

```yaml
---
# 页面布局
layout: doc
# 文章排序
order: 10
# 草稿版本
draft: false
# 栏目首页（index.md）是否可链接：在导航/侧边栏/面包屑中生成可点击链接，false 为不可链接（默认可链接）
linkable: true
# --------------------------------
# 主要用于SEO
title: 标题
description: 一句话摘要，用于列表页与 SEO
permalink: /product/fcs-v1
# --------------------------------
# 文章短标题、分类、标签、作者和日期
shortTitle: 短标题
category: 飞控
tags: [飞控, 仿真]
author: 作者名
date: 2026-08-28
# --------------------------------
# 主要用于卡片
summary: 一句话简介
cover: /assets/images/blog/xxx.png
gallery:
  - /assets/images/blog/xxx-1.png
  - /assets/images/blog/xxx-2.png
price: 100
shopUrl: https://shop.example.com/xxx
helpUrl: /manual/xxx
---
```

必须遵守：

- `title` SEO / 浏览器标题
- `description` SEO / 浏览器描述
- `permalink` 如果是相对地址，则需要根据上级栏目的链接进行拼接
- `draft: true` 在开发环境允许预览，但构建和列表页必须排除草稿，未填写 `draft` 时按正式内容处理
- `linkable`（仅栏目/子栏目首页 `index.md` 生效，可选）控制该首页是否作为可点击链接入口；缺省或 `true` 默认可链接。写 `false` 时（适用于仅作分组占位、无落地内容的栏目首页）各导航面表现不同：
  - 顶部导航：该子栏目**不生成下拉条目**（直接跳过）；若某顶级栏目自身 `linkable: false` 且二级条目又都被跳过，则整个栏目不生成
  - 侧边栏：分组标题仍展示但不可点击（无 `link`，仍可折叠展开子条目）
  - 面包屑：该级面包屑仍展示文字但不可点击
  - 页面本身仍会构建，URL 由 `permalink` 决定，直接访问与正文内链不受影响
- `category` 分类名（可选），用于分类筛选；未填写时默认取所属子栏目名，无栏目则兜底 `uncategorized`。分类 slug 由名称 slugify 推导，不手写
- `tags` 标签，不用于产品分类筛选
- `date` 仅用于显示，不参与排序
- `author` 作者，用于文章/博客的列表展示（可选）
- `shortTitle`（展示短标题）可选，用于卡片、侧边栏、面包屑、详情 H1 等展示场景，未填写时回退到 `title`
- `summary`（列表卡片/详情页摘要）未填写时回退到 `description`
- `cover` 列表卡片的封面图片
- `gallery`（图片数组）用于产品详情页多图图库，优先于单张 `cover`；
- `price` 价格，用于产品列表卡片与详情页（可选）
- `shopUrl`（外部购买链接）可选，未填写使用默认链接 `https://shop103678810.taobao.com`
- `helpUrl`（帮助文档链接）可选，用于产品列表卡片的「帮助」按钮，未填写时回退到 `/manual/`

## 9. 写作规范

- 中英文之间需要增加空格
- 中文与数字之间需要增加空格
- 数字与单位之间无需增加空格
- 全角标点和其他字符之间不加空格
- 链接之间增加空格
- 加粗文本前后增加空格
- 中文正文使用中文标点，英文正文使用英文标点，并在同一文件中保持一致
- 同一篇文档中应保持中英文风格统一，不要混杂中英标点

## 10. 链接规范

- 页面内链接统一使用**物理路径（含排序前缀）**，且尽量用相对路径：文件链接带 `.md`（如 `../03-quickstart/01-preparation.md`），目录/栏目链接用尾斜杠（如 `../../../download/`，不带 `index.md`）
- 站内链接建议保证可解析，不要出现死链或错链

## 11. 国际化

- 新增中文页面时，不要在英文侧创建空文件占位
- 英文页面缺失时，语言切换应回到中文对应页，若中文页也不存在则回到首页

## 12. 实现与处理原则

以下规则用于指导实际修改与维护行为，优先以真实代码和现有仓库结构为准。

### 12.1 VitePress 实现细节

- 优先复用默认主题并做扩展，不要从零重写主题
- `createContentLoader` 必须在构建期生成数据，不要在客户端扫描目录
- `glob` 模式不要携带前导斜杠，例如：`product/**/*.md`，不能写成 `/product/**/*.md`
- 自定义 Vue 组件放在 `.vitepress/theme/components/` 并通过 `enhanceApp` 全局注册
- `docsSidebar()`、`buildRewrites()` 等辅助函数应放在 `.vitepress/` 的独立模块中，`config.mts` 只负责 import
- 顶部导航由 `docsNavbar()`（`config/navbar.mts`）扫描 `source/` 自动生成：不写死栏目名单，顶级栏目按 `index.md` 的 `order` > 目录排序前缀 > 名称排序，草稿栏目（`draft: true`，如 news / discovery）自动排除，非 root 的语言目录（如 `en`）由 `config.mts` 从 locales 配置派生后跳过。VitePress 要求下拉组顶级项**不带** `link`（带了会渲染成普通链接），故含二级条目的栏目输出为 `{ text, items, sectionLink }`，`items` 为二级菜单：栏目的直接子目录（子栏目）与直接 md 页面（不含 index.md）都算二级条目，混合后统一按 `frontmatter.order` > 排序前缀 > 名称排序；栏目首页链接放在自定义字段 `sectionLink` 中，由 `theme/Layout.vue` 的 `onNavGroupClick` 接管桌面端一级菜单按钮的点击跳转（VitePress 下拉组按钮默认只展开、不导航）；二级菜单使用 VitePress 自带下拉（桌面端悬停展开、移动端汉堡菜单内手风琴展开）。`theme/components/NavbarRibbon.vue` 是已禁用的定制浮层方案，未在 `Layout.vue` 中挂载，需要时可再启用
- 导航/侧边栏在 dev server 启动时生成一次，目录结构或 frontmatter 变化不会自动反映到 `themeConfig.nav` / `sidebar`；`config/hot-restart.mts` 的 `hotRestartPlugin()`（仅 dev）监听 `source/` 下这类变更并触发 VitePress 自动重启，实现热更新：新增/删除任意目录或 `.md`（含文件、文件夹改名，chokidar 报 unlink+add）、修改任意 md 的 frontmatter（title / shortTitle / permalink / order / draft 等）或一级标题都会重启；只改正文（frontmatter 与一级标题不变）走原生 HMR，不重启
- TypeScript 代码文件统一用 `.mts` 扩展名（ESM），普通模块文件名用 kebab-case；`createContentLoader` 数据文件与所用布局同名同目录（如 `CatalogLayout.data.mts`，`.data.` 是 VitePress 识别加载器的必需后缀）；markdown-it 插件放在 `.vitepress/markdown/` 下
- 通用 tab 组：`::: tabs` 容器内每个 `@tab 标题` 行折叠为一个 tab（由 `.vitepress/markdown/plugin-markdown-tab.mts` 的 block rule 生成，任意页面可用），语法为 `::: tabs` / `@tab 标题` / 内容 / `:::`；也可在 `::: tabs` 后指定自定义分隔符（如 `::: tabs ===`、`::: tabs ##`）
- 卡片容器：`::: xxx-card` 按类型渲染不同卡片（由 `.vitepress/markdown/plugin-markdown-card.mts` 生成），内容为 YAML 代码块包裹的卡片列表；当前支持图文卡片 `::: image-card`（cover / link / name / desc / author / avatar）、链接卡片 `::: link-card`（link / name / desc）、产品卡片 `::: product-card`（cover / link / name / summary / price / category / shopUrl / helpUrl，样式同产品列表卡片）
- 若开启 `cleanUrls`，会导致静态托管环境下出现 404，故必须保持 `cleanUrls` 关闭；非首页页面仍产出 `xxx.html`
- 通过 VitePress 的 `rewrites` 实现真实路由：`/manual/foo` → `manual/foo.md`（去前导 `/`、补 `.md`），否则会生成无扩展名文件
- 页面元数据统一经 `.vitepress/config/page.mts`：`getUrl()` 取 link（无扩展名）、`resolvePageUrl()` 取含 `.md` 的最终路径（供 `rewrites` 与正文内链），二者都支持绝对/相对 `permalink`；`getDisplayTitle()` 取显示标题，`getCategoryName()` / `getCategorySlug()` / `getTagSlug()` 取分类/标签的 name / slug（经全局 `categoryMap` / `tagMap`）
- 侧边栏与面包屑按物理路径划分栏目：侧边栏用 `docsSidebars()`（内部 `sectionRoutes()` 收集被 permalink 逃逸出栏目根的子栏目路由，仍映射回所属栏目侧边栏）；面包屑用 `Breadcrumb.data.mts` 按物理目录层级构建，二者都不受 permalink 的 URL 影响

- 自定义容器（`::: tip` / `info` / `warning` / `danger` / `details`）默认标题为英文（TIP / INFO / …）；中文标题在 `config/locales.mts` 的 `locales.root.markdown.container` 本地化（`tipLabel: '提示'` 等），英文（en）不覆盖、沿用默认。**注意 VitePress 2.0.0-alpha.19 的渲染器单例问题**：本地搜索插件（`vitepress:local-search`）会用未合并 `locales` 的原始 `markdown` 选项最先创建 markdown 渲染器（`createMarkdownRenderer` 内 `if (md) return md` 缓存），导致 `locales.<index>.markdown` 在正式构建时被忽略；故 `config.mts` 把各语言 `markdown` 同步到顶层 `markdown.locales`（`markdownLocales`）作为 workaround，升级修复后可移除

### 12.2 内容处理原则

在本仓库中进行内容修改时，优先遵守以下检查清单：

- 以现有仓库结构和实际代码为准，而不是凭印象或模板扩写。
- 先参考已有页面和内容风格，再决定是否新增或重构内容。
- 若事实信息不确定，必须先问用户，而不是凭印象编造。
- 避免制造未存在的产品、型号、参数或支持能力描述。
- 任何新增内容都应遵循当前目录命名、排序和 `frontmatter` 约定。
- 对于产品、支持能力等事实性描述，必须以 README 和现有官网内容为准。

## 13. 构建与验证

在提交前，必须执行：

```bash
pnpm docs:build
```

随后按如下检查清单逐项确认：

- [ ] Markdown 文件名是否符合规范
- [ ] 站内链接和图片路径是否有效
- [ ] `frontmatter` 是否完整正确
- [ ] `permalink` 是否按规范生成真实路由，重复的 `permalink` 不静默覆盖，而是输出构建警告并列出冲突文件
- [ ] `draft: true` 是否在构建和列表中被正确排除（开发环境应允许预览）
- [ ] `cleanUrls` 是否保持关闭
- [ ] 构建产物 `build/` 是否正常生成且未提交到仓库

## 14. 许可证范围

- NextPilot 飞控代码采用 BSD 3-Clause
- 本网站文档和原创内容采用 CC BY 4.0
- 第三方图片、Logo 和引用内容遵循各自原始许可
