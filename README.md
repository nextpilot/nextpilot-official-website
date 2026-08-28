# NextPilot 官方网站

基于 [VitePress](https://vitepress.dev/) 构建的 [NextPilot Flight Control 官方网站](https://nextpilot.org)，提供产品介绍、解决方案、用户手册与开发指南等内容。

编译好的网页托管在本仓库的 [gh-pages](https://github.com/nextpilot/nextpilot-flight-control/tree/gh-pages) 分支，可通过以下链接访问：

- 官方网站：<https://nextpilot.org>
- 用户手册：<https://nextpilot.org/manual>
- 开发指南：<https://nextpilot.org/develop>

## 技 术 栈

- [Node.js](https://nodejs.org/) ≥ 20.19（当前开发环境 v22.22.3）
- [VitePress](https://vitepress.dev/) `2.0.0-alpha.19` — 静态站点生成器
- [pnpm](https://pnpm.io/) `11.8.0` — 包管理器

## 快速开始

国内网络环境下安装依赖较慢，可配置 npm 镜像源加速：

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

```
.
├── .vitepress/          # VitePress 配置
│   └── config.mts       # 站点配置（标题、导航、本地化等）
├── source/              # 内容根目录（srcDir）
│   ├── index.md         # 首页
│   ├── aboutus/         # 关于我们
│   ├── solution/        # 解决方案
│   ├── product/         # 产品中心
│   ├── manual/          # 用户手册
│   ├── develop/         # 开发指南
│   ├── discovery/       # 精彩探索
│   ├── news/            # 新闻资讯
│   ├── download/        # 资料下载
│   ├── blog/            # 博客
│   └── en/              # 英文站
└── public/              # 静态资源（logo、favicon 等）
```

## 相关链接

- 项目源码：[nextpilot/nextpilot-flight-control](https://github.com/nextpilot/nextpilot-flight-control)

## 许 可 证

- 本站内容（文档、图片等）：[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)：开放共享、转载、修改与商用，但须保留署名来源
- NextPilot 飞行控制软件：[BSD 3-Clause](https://opensource.org/license/bsd-3-clause)：自由使用、修改、再分发与商用，但须保留版权声明，不得以项目方名义背书
