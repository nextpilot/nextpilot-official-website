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
- `about` / `manual` / `develop` / `community` 自动侧边栏生成
- 产品列表页（`createContentLoader` + `ProductList` 组件）

待完成或待完善：

- 文章列表页：`news` / `blog`
- `permalink` 重写：`buildRewrites()`
- `.vitepress/config.mts` 中的 `rewrites` 仍保持注释状态

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
│   ├── sidebar.ts                # 自动生成侧边栏的逻辑
│   ├── theme/                    # 自定义主题、组件与全局样式
│   └── ...                       # 其余 VitePress 相关文件
├── source/                        # 内容源目录，Markdown 页面都放在这里
│   ├── index.md                  # 首页
│   ├── about/                    # 关于我们栏目
│   ├── solution/                 # 解决方案栏目
│   ├── product/                  # 产品中心
│   │   ├── aircraft/             # 无人机平台
│   │   ├── controller/           # 控制器
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
│   │   └── manual/               # 用户手册（开源文档）
│   ├── discovery/                # 发现/展示栏目（占位待建）
│   ├── news/                     # 新闻资讯
│   ├── download/                 # 资源下载
│   ├── blog/                     # 博客
│   └── en/                       # 英文站内容目录
├── public/                        # 静态资源目录，打包后直接输出
│   ├── images/                   # 图片资源
│   ├── firmware/                 # 固件/下载文件
│   ├── scripts/                  # 脚本文件
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

- 目录格式推荐：`<column>/<xx-category>/<...>/<yy-markdown.md>`
  - `<column>` 为栏目，`<category>` 为分类，`<...>` 为子分类，目录层级建议不超过 5 级
  - `xx`、`yy` 是排序前缀，通常为 `两位整数`，或者 `yyyymmdd` 日期格式
  - `两位整数` 是时间不敏感栏目（比如 product、solution等）的排序前缀
  - `yyyymmdd` 是时间敏感类型栏目（比如 blog、news等）的排序前缀
- 文件和目录名一律小写，且只允许：数字、小写字母、横杠（优先）、下划线（谨慎）、小数点（仅用于版本号），不允许中文或特殊字符
- 图片统一放在 `public/images/<栏目>/`，Markdown 中使用 `/images/...` 绝对路径引用
- 图片文件名应使用有意义的英文小写 slug，去掉自动生成的时间戳前缀（如 `image-20260623150217001.png` → `sim-main.png`）

## 6. 标题与排序

### 6.1 标题

- 文件夹标题：优先取 `index.md` 的 `frontmatter.shortTitle` > `frontmatter.title` > 一级标题 > 目录名去掉排序前缀
- 文档页面标题：优先取 `frontmatter.shortTitle` > `frontmatter.title` > 一级标题 > 文件名去掉排序前缀
- `shortTitle`（展示短标题）可选，用于卡片、侧边栏、面包屑、详情 H1 等展示场景，未填写时回退到 `title`
- SEO/浏览器标题（`<title>`）由 VitePress 依据 `frontmatter.title` 生成
- 建议每个页面都显式写 `frontmatter.title`，并尽量与文件命名保持一致
- 标题尽量与目录名语义匹配，体现栏目和内容主题，不要出现重复或过度泛化

### 6.2 排序

- 文件夹排序：优先取 `index.md` 的 `frontmatter.order`，再比较目录名前缀
- 文档页面排序：优先取 `frontmatter.order`，再比较文件名前缀
- `frontmatter.order`（越小越靠前），相同时继续比较排序前缀，仍相同时按完整路径稳定排序
- `两位整数` 是时间不敏感栏目（比如 product、solution等）的排序前缀，按照从小到大排序
- `yyyymmdd` 是时间敏感类型栏目（比如 blog、news等）的排序前缀，按时间倒序排列

说明：

- `frontmatter.date` 仅用于显示，不参与排序，`date` 不覆盖文件名中的日期排序前缀。

## 7. 栏目设计与内容模型

本节按统一模板描述各栏目，以保证颗粒度一致，并明确当前内容模型与后续扩展边界：

- 栏目定位与页面类型
- 目录结构与分组方式
- 标题来源与展示规则
- 排序与筛选规则
- 关键约束与待办状态

### 7.1 关于我们 / 解决方案

- 定位：`about` 与 `solution` 都属于静态页面栏目，分别用于品牌介绍与解决方案概览。
- 目录规则：均采用扁平结构：`<栏目>/<xx-page.md>`，每个页面对应一个单独文档，不做深层嵌套。
- 标题规则：`about` 侧边栏条目优先取 `frontmatter.title`，其次取文件名去掉排序前缀；`solution` 列表页标题优先取 `frontmatter.title`，否则回退到文件名去掉排序前缀。
- 排序规则：统一以 `frontmatter.order` 为主，再按文件名排序前缀排序。
- 约束：`about` 使用自动 sidebar，`solution` 属于 `page` 类型，不显示侧边栏，使用 `createContentLoader` + 列表组件渲染。

### 7.2 产品中心

- 定位：`product` 是产品展示栏目，采用列表页 + 详情页结构。
- 目录规则：产品目录结构为 `product/<xx-category>/<yy-product.md>`，`xx` 与 `yy` 为两位整数排序前缀；分类目录为 `aircraft`、`controller`、`datalink`、`navigator`、`peripheral`。
- 标题规则：分类标识（slug，用于筛选）优先取 `frontmatter.category`，否则用目录名去掉排序前缀；分类显示名优先取 `index.md` 的 `frontmatter.title`，否则目录名去掉排序前缀；产品名优先取 `frontmatter.title`，其次一级标题，再退回文件名去掉排序前缀。
- 排序规则：分类排序优先取 `index.md` 的 `frontmatter.order`，再比较目录名前缀；产品排序优先取 `frontmatter.order`，再比较文件名前缀。
- 过滤规则：列表页必须过滤 `index.md` 和 `draft: true`，并支持按分类筛选与全文搜索；分类筛选不能使用 `tags`。
- 约束：卡片展示依赖 `title / cover / summary / price / tags` 等 frontmatter，未填写字段不显示；路由优先使用 `frontmatter.permalink`，否则回退文件路径。
- 布局：产品详情页使用 `layout: product` 自定义布局（`.vitepress/theme/ProductLayout.vue`），左侧图库 + 右侧摘要（标题/简介/价格/CTA），下方渲染详细正文；正文不写首行 `# 标题`（标题由 `frontmatter.title` 在布局中渲染）。
- 列表页布局：产品列表页（`product/index.md`）使用 `layout: catalog`（`.vitepress/theme/CatalogLayout.vue`），布局自动读取同名数据加载器 `.vitepress/theme/CatalogLayout.data.mts` 并按当前目录分类过滤后渲染 `ProductList` 网格，无需在 md 里写 `<script setup>` 与 `<ProductList>`；`product/<category>/index.md` 若同样声明 `layout: catalog`，则自动只展示该分类。加载器以 `frontmatter.layout === 'product'` 识别产品详情页，不绑定栏目目录。
- 正文 tabs：正文中每个二级标题（`##`）会自动折叠为一个 tab（由 `.vitepress/markdown/product-heading-tabs.mts` 插件在构建期生成，对声明 `layout: product` 的页面生效）；少于两个二级标题时不生成 tab。

### 7.3 用户手册 / 开发指南 / 社区支持

- 定位：`manual`、`develop`、`community` 属于 `docs` 类型，主要展示文档内容和知识库。
- 目录规则：通常使用 `manual/<xx-group>/<yy-docs.md>`、`develop/<...>` 的层级结构，`index.md` 仅用作分组首页。
- 标题规则：分组标题优先取 `index.md` 的 `frontmatter.title`，其次取目录名去掉排序前缀；条目标题优先取 `frontmatter.title`，其次一级标题，再退回文件名去掉排序前缀。
- 排序规则：分组排序优先取 `index.md` 的 `frontmatter.order`，其次目录名前缀；条目排序优先取 `frontmatter.order`，其次文件名前缀。
- 约束：侧边栏仅展示实际文档条目，不显示 `index.md`；左侧自动生成 sidebar，右侧显示 TOC；路由优先使用 `frontmatter.permalink`，否则回退到文件路径。

### 7.4 新闻资讯 / 博客

- 定位：`news` 与 `blog` 属于 `post` 类型，用于发布文章与更新信息。
- 目录规则：目录结构类似 `news/<xx-category>/<yyyymmdd-post.md>` 和 `blog/<xx-category>/<yyyymmdd-post.md>`，`index.md` 仅用于分类标题和排序，不作为文章页面。
- 标题规则：分类标识（slug，用于筛选）优先取 `frontmatter.category`，否则用目录名去掉排序前缀；分类显示名优先取 `index.md` 的 `frontmatter.title`，否则目录名去掉排序前缀；文章标题优先使用 `frontmatter.title`，其次一级标题，再退回文件名去掉排序前缀。
- 排序规则：分类排序优先取 `index.md` 的 `frontmatter.order`，其次目录名前缀；文章排序优先用 `frontmatter.order`，其次文件名前缀；时间型栏目按 `yyyymmdd` 倒序排列。
- 展示规则：文章列表页可提取 `title / cover / summary / tags / date / author` 等字段；列表页必须过滤 `index.md` 和 `draft: true`。
- 约束：`news` 当前仍为待建栏目，不接入 nav，也不实现列表页；`blog` 为正式栏目，支持分类和 tags 过滤。

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
# --------------------------------
# 主要用于SEO
title: 标题
description: 一句话摘要，用于列表页与 SEO
permalink: /product/fcs-v1
# --------------------------------
# 文章短标题、分类、标签、作者和日期
shortTitle: 短标题
category: controller
tags: [飞控, 仿真]
author: 作者名
date: 2026-08-28
# --------------------------------
# 主要用于卡片
summary: 一句话简介
cover: /images/blog/xxx.png
gallery:
  - /images/blog/xxx-1.png
  - /images/blog/xxx-2.png
price: 100
shopUrl: https://shop.example.com/xxx
helpUrl: /manual/xxx
---
```

必须遵守：

- `Frontmatter` 并非必须项，但推荐显式填写
- `permalink` 必须以 `/` 开头且不带 `.html`，例如 `/manual/foo`
- `draft: true` 在开发环境允许预览，但构建和列表页必须排除草稿，未填写 `draft` 时按正式内容处理
- `tags` 不用于产品分类筛选
- `date` 仅用于显示，不参与排序
- `gallery`（图片数组）用于产品详情页多图图库，优先于单张 `cover`；`shopUrl`（外部购买链接）可选，未填写则不显示「立即购买」按钮
- `helpUrl`（帮助文档链接）可选，用于产品列表卡片的「帮助」按钮，未填写时回退到 `/manual/`
- `shortTitle`（展示短标题）可选，用于卡片/侧边栏/面包屑/详情 H1，未填写时回退到 `title`
- `summary`（列表卡片/详情页摘要）未填写时回退到 `description`

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

- 页面内链接尽量使用相对路径，省略 `.md` 和 `.html` 扩展名
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
- TypeScript 代码文件统一用 `.mts` 扩展名（ESM），普通模块文件名用 kebab-case；`createContentLoader` 数据文件与所用布局同名同目录（如 `CatalogLayout.data.mts`，`.data.` 是 VitePress 识别加载器的必需后缀）；markdown-it 插件放在 `.vitepress/markdown/` 下
- 通用 tab 组：`::: tabs` 容器内每个 `=== 标题` 行折叠为一个 tab（由 `.vitepress/markdown/tabs-group.mts` 的 block rule 生成，任意页面可用），语法为 `::: tabs` / `=== 标题` / 内容 / `:::`
- 若开启 `cleanUrls`，会导致静态托管环境下出现 404，故必须保持 `cleanUrls` 关闭；非首页页面仍产出 `xxx.html`
- 通过 VitePress 的 `rewrites` 实现真实路由：`/manual/foo` → `manual/foo.md`（去前导 `/`、补 `.md`），否则会生成无扩展名文件

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
