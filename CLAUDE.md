# CLAUDE.md

本文件为 Claude Code 提供本仓库的工作指引。

## 项目概览

本项目是 **NextPilot 官方网站**，使用 [VitePress](https://vitepress.dev/) 搭建。旧版文档站点：<https://docs.nextpilot.org> （mkdocs 生成），本项目是其 VitePress 重构版。

NextPilot（`nextpilot-flight-control`）是一款国产开源先进自动驾驶仪（飞控系统），代码仓库托管于 [GitHub](https://github.com/nextpilot) 与 [Gitee](https://github.com/nextpilot)：

- 基于 **RT-Thread** 实时操作系统，核心算法移植自 **PX4**
- 面向教育、研究和工业领域，采用 uORB / PARAM / AIRFRAME 等可扩展架构
- 支持多旋翼、固定翼、垂起复合翼等机型，支持 MIL / SIL / HIL / SIH 仿真

> **注意**：涉及 NextPilot 产品参数、硬件型号、支持机型等事实性描述时，不要凭印象编造。以 `nextpilot-flight-control` 仓库 README 和现有官网内容为准，拿不准就先问用户。

## 当前状态

当前已完成 VitePress 基础配置、目录迁移（`srcDir` 指向 `source/`）、aboutus / manual / develop / community 自动侧边栏（`docsSidebar()`）以及产品列表页（`createContentLoader` + `ProductList` 组件）。以下功能**尚未实现**：文章列表页（news / blog）、`permalink` 重写（`buildRewrites()`）；`config.mts` 中的 `rewrites` 目前仍为注释状态。

## 环境与技术栈

- VitePress 2.0（当前 2.0.0-alpha.19，Vite 8）+ Vue 3 自定义主题组件
- Node.js v22（本机 v22.22.3）
- **pnpm**（本机 v11.8.0，npm 10.9.8 亦可用）
- 内容以 Markdown 为主，构建产物为静态站点

```bash
pnpm install          # 安装依赖
pnpm docs:dev         # 本地开发服务器（默认 http://localhost:5173）
pnpm docs:build       # 生产构建，产物在 build/
pnpm docs:preview     # 本地预览构建产物
```

`package.json` 中的 scripts 应对应为 `vitepress dev`、`vitepress build`、`vitepress preview`。

## 目录结构

采用 VitePress 默认布局，`srcDir` 指向 `source/`，`outDir` 指向 `build/`。

```
nextpilot-official-website/
├── .vitepress/
│   ├── config.mts         # 站点配置：nav、sidebar、locales、主题
│   ├── sidebar.ts         # docsSidebar()：aboutus/manual/develop/community 侧边栏生成
│   ├── rewrites.ts        # buildRewrites()：permalink → 真实路由（待建）
│   └── theme/             # 自定义主题：布局扩展、组件、样式
│       ├── index.ts       # 主题入口，enhanceApp 全局注册组件
│       ├── Layout.vue     # 扩展布局
│       ├── style.css      # 自定义样式
│       └── components/    # 全局注册的 Vue 组件
│           ├── ProductList.vue    # 产品列表（卡片 + 分类筛选 + 搜索）
│           ├── SolutionList.vue   # 解决方案列表（卡片）
│           └── Breadcrumb.vue     # 面包屑
├── source/                # 内容根目录（srcDir: 'source'）
│   ├── index.md           # 首页（hero + features）
│   ├── aboutus/           # 关于我们：团队、发展历程、联系方式、合作伙伴
│   ├── solution/          # 解决方案（solutions.data.mts + SolutionList 列表页）
│   ├── product/           # 产品：每个产品一个 md，按 5 大分类建子目录
│   │   ├── index.md       # 产品列表页
│   │   ├── product.data.mts   # createContentLoader 收集产品数据
│   │   ├── aircraft/      # 无人机
│   │   ├── controller/    # 控制器
│   │   ├── datalink/      # 通信链路
│   │   ├── navigator/     # 导航传感
│   │   └── peripheral/    # 其它外设
│   ├── manual/            # 用户手册：用户手册、FAQ
│   ├── develop/           # 开发指南：开发指南、API 参考
│   ├── community/         # 社区支持：技术支持、贡献代码、行为准则、开源许可
│   ├── discovery/         # 精彩探索（待建）
│   ├── news/              # 新闻资讯：版本发布、社区活动、公告（待建）
│   ├── download/          # 资料下载：固件、软件、文档（内容待建）
│   ├── blog/              # 博客：技术文章、开发笔记、案例分享
│   └── en/                # 英文站，目录结构与中文侧镜像（规划中）
├── public/                # 静态资源，按原路径映射到站点根
│   ├── images/            # 图片，按栏目分子目录（aboutus/community/product/solution）
│   ├── firmware/          # 固件（.bin）
│   ├── CNAME              # 域名 CNAME（随构建复制）
│   ├── favicon.png
│   └── logo.png
├── build/                 # 构建产物（outDir，不提交）
├── package.json
├── pnpm-lock.yaml
├── .gitignore
├── LICENSE
└── README.md
```

vitepress 会按照目录结构自动生成一个结构化的 侧边栏、目录树、面包屑、文章列表、文章分析 等数据。

### 文件名

- 目录格式为 `<column>/<xx-category>/<yy-subcategory>/<zzzz-markdown.md>`，其中`<column>`是栏目，`<category>` 是分类，`subcategory` 是子分类，`markdown.md`是具体的文档，`xx` 和 `yy` 是分类的前缀排序（一般是 两位整数，可以不连续）， `zzzz` 是文档的排序前缀（一般是 两位整数 或者 `yyyymmdd` 格式文档创建日期）
- 文件和文件夹名称，只允许数字、小写字母、横杠（优先使用）、下划线（谨慎使用）、小数点（仅版本号时），不允许中文、特殊字符等
- 所有文件与目录名（md、图片、固件、配置文件等）**一律小写**，标题采用大写形式（如 `NP-FCC-H05`）只出现在  `frontmatter.title`，但文件名中写作小写 `np-fcc-h05`
- 图片文件名使用有意义的英文小写 slug，**去掉自动生成的 `image-` 前缀**（如 `image-20260623150217001.png` 应改为 `sim-main.png` 这类有意义的名称，而不是保留时间戳）

### 文档标题

侧边栏和目录树的标题获取有如下特性：

- 针对文件夹，先分别扫描该文件夹下的 `index.md`，并尝试获取文件的 `frontmatter.title` 或`一级标题`，如果获取到标题，则使用，否则使用文件夹名（去掉排序前缀）
- 针对 `Markdown` 文档，其获取顺序：`frontmatter.title` > `Markdown 文件一级标题` > `Markdown 文件名`（去掉排序前缀）
面包屑的标题默认按照 Markdown 文件所在的目录层级名进行获取。
- 建议给每个 `Markdown` 文件设置 `frontmatter.title`，且文件的命名与 `frontmatter.title` 保持一致。

### 文档排序

侧边栏、目录树、列表页中项目的排序逻辑如下：

- **所有页面和文件夹**排序优先级统一为： `frontmatter.order`（越小越靠前）> 文件或文件将的排序前缀（序号越小越靠前，日期越大越靠前）；`frontmatter.order` 相同时继续比较排序前缀，仍相同时按完整路径稳定排序
- 排序前缀分两类：`两位整数` 前缀用于对时间无要求的页面（docs、product；aboutus、solution等），`yyyymmdd` 日期前缀用于时间感强的页面（blog、news），日期按照倒序排列
- `Frontmatter.date` 日期字段 **不参与排序**，也不覆盖文件名中的日期排序前缀，它只是为了在页面显示

## 栏目设置

| 栏目 | 模型 | 路径 | 内容定位 | 组织方式 |
| ------ | ------ | ------ | ---------- | ---------- |
| 关于我们 | page | `/aboutus/` | 团队介绍、发展历程、开源协议、联系与合作 | 扁平结构，左侧侧边栏自动生成 |
| 解决方案 | page | `/solution/` | 面向教育、科研、工业等场景的解决方案 | 列表页（卡片），无侧边栏（已实现） |
| 产品中心 | product | `/product/` | 飞控硬件、软件能力、机型与仿真支持 | 列表页（卡片 + 分类筛选 + 搜索），每款产品一个详情页 |
| 用户手册 | docs | `/manual/` | 用户手册、FAQ | 层级最深，**侧边栏按目录结构自动生成** |
| 开发指南 | docs | `/develop/` | 开发指南、API 参考 | 层级最深，**侧边栏按目录结构自动生成** |
| 社区支持 | docs | `/community/` | 技术支持、贡献代码、行为准则、开源许可 | 层级最深，**侧边栏按目录结构自动生成** |
| 新闻资讯 | post | `/news/` | 版本发布、社区活动、公告 | 按时间倒序列表，条目短（待建） |
| 博客 | post | `/blog/` | 技术文章、开发笔记、应用案例 | 按时间倒序列表，正文长 |
| 精彩探索 | image | `/discovery/` | 活动照片、案例图集等精彩图片/视频 | 图片/视频卡片墙（待建） |
| 资料下载 | 待定 | `/download/` | 固件、软件、文档等资料下载 | 已接入 nav，内容待建 |

### 关于我们（aboutus）和解决方案（solution）

- `/aboutus/` 和 `/solution/` 目录结构均为扁平的 `<栏目>/<xx-page.md>`，`xx` 是排序前缀，每个 md 一个页面
- `/aboutus/` 使用左侧自动侧边栏（`docsSidebar('aboutus')`），条目名优先 frontmatter `title`，其次文件名（去除排序前缀），排除 `index.md`
- `/solution/` 属于 `page` 类，**无侧边栏**，用 `createContentLoader`（`solutions.data.mts`）+ `SolutionList` 组件渲染卡片列表；条目标题优先 frontmatter `title`，否则文件名（去除排序前缀）

### 产品中心（product）

- `/product/`属于`product`类，产品列表页采用卡片方式展示`product`目录下的产品（已实现：`product/product.data.mts` 用 `createContentLoader` 收集数据，`ProductList` 组件渲染卡片网格 + 分类筛选 + 全文搜索）
- 产品当前分为 5 大类：`aircraft`（无人机）、`controller`（控制器）、`datalink`（通信链路）、`navigator`（导航传感）、`peripheral`（其它外设）
- 产品目录结构为`product/<xx-category>/<yy-product.md>`，`<category>` 是分类名，`<product.md>` 是详情页面，`xx` 和 `yy` 是 `两位位整数` 作为排序前缀
- 产品列表页卡片展示依赖 `frontmatter（title / cover / summary / price / tags）`等；**可选字段未填写时，卡片上不显示对应内容**（如无 `cover` 就不渲染封面图、无 `price` 就不显示价格）
- 产品列表页，需支持对产品按照 `category` 进行筛选（不使用 `tags` 做分类筛选）和产品全文搜索（搜索框在分类过滤右侧），如果展示的产品太多则需要分页
- 分类名，优先采用 `product.md` 中 `frontmatter.category`，其次 `index.md` 的 `frontmatter.title` ，最后文件夹名去除排序前缀
- 产品名，优先采用 `product.md` 中 `frontmatter.title`，其次 `Markdown 文件一级标题`，最后文件名去除排序前缀
- 分类排序，优先采用 `index.md` 中 `frontmatter.order`，其次采用文件夹名称中的排序前缀
- 产品排序，优先采用  `product.md` 中 `frontmatter.order`，其次采用文件名称中的排序前缀
- 产品列表页面，必须排除所有路径中的 `index.md`，避免对其生成产品卡片，`index.md` 只是用于产品标题和排序
- 路由优先使用  `frontmatter.permalink`，否则回退文件路径

### 用户手册（manual）、开发指南（develop）和社区支持（community）

- `/manual/`和`/develop/`属于 `docs`类，需要在左侧自动生成侧边栏 `sideBar`，右侧显示`TOC`
- 文档目录结构为`manual/<xx-group>/<yy-docs.md>`，`<group>` 是分组目录，`<docs.md>` 是具体页面，`xx`和`yy` 是 `两位整数` 作为排序前缀
- 侧边栏在**配置加载时**，分别读取 `manual/` 和 `develop/` 目录树生成（`docsSidebar()` 返回静态 `SidebarItem[]`，非运行时函数）
- 分组名，优先采用 `index.md` 中  `frontmatter.title` ，其次从文件夹名获取（去除排序前缀）
- 条目名，优先采用 `docs.md` 中  `frontmatter.title`，其次 `Markdown 文件一级标题`，最后从 markdown 文件名提取（去排序前缀）
- 分组排序，优先采用 `index.md` 中 `frontmatter.order`，其次采用文件夹名称中的排序前缀
- 条目排序，优先采用  `docs.md` 中 `frontmatter.order`，其次采用文件名称中的排序前缀
- 侧边栏不显示任何 `index.md`，只作为分组首页，以及分组标题和分组排序
- 路由优先使用  `frontmatter.permalink`，否则回退文件路径（去排序前缀）

### 新闻资讯（news）和博客（blog）

- `/news/`和`/blog/`属于 `post`类，需要生成文章列表页，并能够通过顶部分类和右侧`tags`进行筛选和过滤
- 目录结构为 `news/<xx-category>/<yyyymmdd-post.md>`（blog 同理），`<category>` 是分类目录，`<post.md>` 是文章页面，`xx` 两位整数排序前缀，`yyyymmdd` 是文章新建日期
- 文章列表页，展示的条目应该包含图片、标题、简介、时间、作者等信息，可以从 `frontmatter（title / cover / summary / tags / date / author）`获取
- 分类名，优先采用 `post.md` 中 `frontmatter.category`，其次 `index.md` 的 `frontmatter.title` ，最后文件夹名去除排序前缀
- 文章名，优先采用 `post.md` 中 `frontmatter.title`，其次 `Markdown 文件一级标题`，最后文件名去除排序前缀
- 分类排序，优先采用 `index.md` 中 `frontmatter.order`，其次采用文件夹名称中的排序前缀
- 文章排序，优先采用  `post.md` 中 `frontmatter.order`，其次采用文件名称中的排序前缀
- 文章列表页面，必须排除所有路径中的 `index.md`，他只是用于分类标题和排序
- 路由优先使用 `frontmatter.permalink`，否则回退文件路径
- **news 为待建栏目**：暂不接入 nav、不实现列表页；blog 为正式栏目。两者 frontmatter 与目录规则相同（`post` 类）

### 精彩探索（discovery）

- `/discovery/`属于 `image`类，以图片/视频卡片墙展示活动照片、案例图集等精彩内容
- **待建项目**：暂只保留目录占位，不接入 nav、不实现卡片墙

### 资料下载（download）

- `/download/`用于固件、软件、文档等资料下载
- **内容待建**：已接入顶部导航 nav，但目录暂只保留占位 `index.md`，内容模型（固件/软件/文档如何分类与展示）待定

## 内容约定

### Frontmatter

```yaml
---
title: 标题
description: 一句话摘要，用于列表页与 SEO
summary: 一句话简介               # 简介，用于卡片介绍
permalink: /product/fcs-v1        # 可选，固定访问路径
category: controller
tags: [飞控, 仿真]               # 标签，用于搜索与分类
cover: /images/blog/xxx.png      # 封面，用于卡片封面
price: 100                       # 价格，产品卡片显示（可选，未填则不显示）
order: 10                        # 排序，优先级最高，越小越靠前
date: 2026-08-28                 # 日期，YYYY-MM-DD（不参与排序）
author: 作者名                   # 作者
draft: false                     # 草稿；开发环境可预览，生产环境不发布
---
```

- `Frontmatter` 并不需必须的
- 产品分类和文章分类只由 `frontmatter.category` 和 文件夹名称决定，`tags` 不用于产品分类筛选
- `permalink` 用于固定 URL（如迁移自旧站、需要保持原链接时），重复的 `permalink` 不阻断构建，但必须输出构建警告并列出冲突文件。
- `draft: true` 在开发环境允许预览，但生产构建、产品/文章列表和本地搜索索引必须排除草稿，未填写 `draft` 时按正式内容处理。

### 写作规范

- 中英文之间需要增加空格
- 中文与数字之间需要增加空格
- 数字与单位之间无需增加空格
- 全角标点与其他字符之间不加空格
- 链接之间增加空格
- 加粗文字增加空格
- 中文正文使用中文标点，英文正文使用英文标点，且同一文件内保持一致

### 链接规范

- 在页面之间链接时，建议使用相对路径，但省略`.md` 和 `.html` 文件扩展名，以便 VitePress 可以根据配置生成最终的 URL

### 图片规范

- 图片放在 `public/images/<栏目>/` 下，Markdown 中以 `/images/...` 绝对路径引用

### 国际化

- 中文是默认语言，位于 `source/` 根；英文位于 `source/en/`，目录结构与中文侧一一对应
- 在 `.vitepress/config.mts` 的 `locales` 中为每种语言单独配置 `nav` 和 `sidebar`
- 新增中文页面时，若无对应英文内容，**不要**在英文侧创建占位空文件；英文页面缺失时，语言切换统一回到中文对应页面，若中文对应页面也不存在则回到中文首页
- 英文导航只展示已有英文页面，不为缺失翻译创建死链；中英文目录允许暂时不完全对应

## 开发提示

- 优先复用 VitePress 默认主题（`vitepress/theme`）并做扩展，不要从零写主题
- 需要文章列表页（news / blog 首页）时，用 VitePress 的 `createContentLoader` 在构建期生成数据，不要在客户端运行时扫描目录。**2.0 的 glob 模式不要带前导斜杠**（写 `product/**/*.md`，不是 `/product/**/*.md`）——2.0 用 `path.resolve` 处理模式，前导斜杠会被当成绝对路径丢弃站点根，导致匹配不到任何文件（1.x 无此问题）
- 产品列表页（`/product/`）用 `createContentLoader` 收集 `product/**/*.md` 的页面数据，交给一个 Vue 组件渲染：**卡片网格 + 分类筛选 + 产品全文搜索**；分类筛选不使用 `tags`，筛选与搜索是客户端交互，数据在构建期一次性注入，运行时不发请求
- 使用 `createContentLoader` 收集列表数据时，必须过滤所有 `index.md` 和 `draft: true` 页面；产品搜索应覆盖产品全文，产品分类筛选只使用目录分类，不使用 `tags`
- 自定义 Vue 组件放在 `.vitepress/theme/components/`，通过 `enhanceApp` 全局注册后即可在 Markdown 中使用
- 面包屑（`.vitepress/theme/components/Breadcrumb.vue`）当前页标题优先取 frontmatter `title`，其次 `page.title`，最后路径末段；一级栏目名从 nav（含下拉菜单 `items`）按链接反查，匹配不到回退路径段
- `docsSidebar()`、`buildRewrites()` 等构建期帮助函数放在 `.vitepress/` 下的独立模块（如 `sidebar.ts`、`rewrites.ts`），`config.mts` 只 import 不内联实现，避免 config 膨胀
- `permalink` 用 VitePress 的 `rewrites` 实现为**真实路由**：扫描 `srcDir` 下所有 md 的 `frontmatter.permalink`，生成「源路径 → 目标路径」映射交给 `rewrites`。两个关键点：① **必须用 VitePress ≥ 2.0**（1.6.x 对深层路径重写会生成空文件，chunk 命名 bug）；② rewrite 目标要**带 `.md` 后缀**且**不带前导斜杠**——即 `permalink: /manual/foo`（以 `/` 开头、无扩展名）需转换成目标 `manual/foo.md`（去前导 `/` 加 `.md`），否则 `page.replace(/\.md$/, '.html')` 无法追加 `.html`、会产出无扩展名文件
- **保持 `cleanUrls` 关闭（默认）**：非首页页面产出 `xxx.html`，`permalink: /manual/foo` 的实际路由是 `/manual/foo.html`。开启 `cleanUrls` 会让链接指向去掉 `.html` 的干净 URL，在 GitHub Pages 等无 URL 重写的静态托管上会 404
- `permalink` 必须以 `/` 开头且不带 `.html`；重复 permalink 只发出构建警告并列出冲突文件，不能静默覆盖
- 提交前至少运行 `pnpm docs:build`；同时检查 Markdown 文件名、Frontmatter、站内链接和图片路径。构建产物 `build/` 不提交，生产发布目录为 `build/`，`public/CNAME` 随构建复制

## 许可证范围

- NextPilot 飞控代码采用 BSD 3-Clause
- 本网站文档和原创内容采用 CC BY 4.0
- 第三方图片、Logo 和引用内容遵循各自原始许可
