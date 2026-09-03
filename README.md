# NextPilot 官方网站

这是基于 [VitePress](https://vitepress.dev/) 构建的 [NextPilot Flight Control 官方网站](https://nextpilot.org)，提供产品介绍、解决方案、用户手册与开发指南等内容。

编译好的网页托管在本仓库的 [gh-pages](https://github.com/nextpilot/nextpilot-flight-control/tree/gh-pages) 分支，可通过以下链接访问：

- 官方网站：<https://nextpilot.org>
- 用户手册：<https://nextpilot.org/opensource/manual>
- 开发指南：<https://nextpilot.org/opensource/develop>

## 技 术 栈

- [Node.js](https://nodejs.org/) ≥ 20.19（当前开发环境 v22.22.3）
- [VitePress](https://vitepress.dev/) `2.0.0-alpha.19` — 静态站点生成器
- [pnpm](https://pnpm.io/) `11.8.0` — 包管理器

## 快速开始

国内网络环境下安装依赖较慢，可配置 `pnpm` 镜像源加速：

```bash
# 查看当前镜像源
pnpm config get registry

# 设置国内镜像源（npmmirror）
pnpm config set registry https://registry.npmmirror.com
```

> 其它可选镜像：
>
> - 腾讯 <https://mirrors.cloud.tencent.com/npm/>
> - 华为 <https://mirrors.huaweicloud.com/repository/npm/>

配置后干净重装：

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

编译项目文档：

```bash
# 安装依赖
pnpm install

# 也可仅对本次安装临时使用国内镜像加速
pnpm install --registry=https://registry.npmmirror.com

# 启动本地开发服务器（默认 http://localhost:5173）
pnpm docs:dev

# 构建生产版本
pnpm docs:build

# 本地预览构建产物
pnpm docs:preview
```

## 目录结构

```text
.
├── .vitepress/                     # VitePress 站点配置与主题扩展
│   ├── config.mts                 # 站点主配置
│   ├── config/                    # 配置辅助模块
│   │   ├── sidebar.mts            # 自动生成侧边栏
│   │   └── metahead.mts           # head 标签（canonical / 跳转 / 统计）
│   ├── markdown/                  # Markdown 扩展插件
│   │   ├── plugin-heading-tab.mts
│   │   └── plugin-markdown-tab.mts
│   └── theme/                     # 自定义主题与布局组件
│       ├── CatalogLayout.vue
│       ├── CatalogLayout.data.mts
│       ├── ProductLayout.vue
│       ├── components/
│       └── index.mts
├── source/                        # 内容源目录，VitePress srcDir
│   ├── index.md                   # 首页
│   ├── about/                     # 关于我们
│   ├── blog/                      # 技术博客
│   ├── discovery/                 # 展示/占位栏目
│   ├── download/                  # 资源下载
│   ├── en/                        # 英文站内容
│   ├── manual/                    # 用户手册（产品导向）
│   │   ├── aircraft/              # 无人机平台
│   │   ├── autopilot/             # 飞行控制
│   │   ├── datalink/              # 通信链路
│   │   ├── navigator/             # 导航传感
│   │   └── peripheral/            # 其它外设
│   ├── news/                      # 新闻资讯
│   ├── opensource/                # 开源项目
│   │   ├── community/             # 社区支持
│   │   ├── develop/               # 开发指南
│   │   └── manual/                # 用户手册（开源文档）
│   ├── product/                   # 产品中心
│   │   ├── aircraft/              # 无人机平台
│   │   ├── autopilot/             # 飞行控制
│   │   ├── datalink/              # 通信链路
│   │   ├── navigator/             # 导航传感
│   │   └── peripheral/            # 其它外设
│   └── solution/                  # 解决方案
├── public/                        # 静态资源目录
│   ├── CNAME
│   ├── favicon.png
│   ├── logo.png
│   └── assets/                    # 静态资源（images/ files/ scripts/）
├── build/                         # 生产构建输出，自动生成
├── package.json
├── pnpm-lock.yaml
├── README.md
├── LICENSE
├── CLAUDE.md
└── ...
```

## 功能概览

- 自动生成文档侧边栏与栏目导航
- 产品列表页与详情页分离布局
- 自定义产品页顶部图集和摘要区
- Markdown 二级标题自动折叠为产品页 Tabs
- 支持中英文站点配置与多语言导航
- 生成 sitemap 与站内固定路由配置

## 相关链接

- 项目源码：[nextpilot/nextpilot-flight-control](https://github.com/nextpilot/nextpilot-flight-control)

## 许 可 证

- 本站内容（文档、图片等）：[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)：开放共享、转载、修改与商用，但须保留署名来源
- NextPilot 飞行控制软件：[BSD 3-Clause](https://opensource.org/license/bsd-3-clause)：自由使用、修改、再分发与商用，但须保留版权声明，不得以项目方名义背书
