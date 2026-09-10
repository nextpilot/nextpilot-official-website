---
title: 文档中心
description: NextPilot 文档中心，涵盖产品用户手册、飞控使用教程、开发指南与社区支持。
order: 4
sidebar: false
# 页底上一页/下一页：本页关闭了侧边栏，VitePress 无法从侧边栏推导，需显式指定（按顶级栏目顺序）
prev:
  text: 产品中心
  link: /product/
next:
  text: 资源下载
  link: /download/
---

# 文档中心

NextPilot 文档按用途分为四个子栏目：装机、配置和日常使用请查阅[产品手册](/docs/manual/)与[使用教程](/docs/guide/)，源码构建、二次开发和社区协作请参考[开发指南](/docs/develop/)。

::: link-card 2

```yml
- link: /docs/manual/
  name: 产品手册
  icon: 📘
  desc: 硬件产品的随箱手册，按型号讲解整机平台、飞控、通信链路与导航外设的接线安装、参数配置、固件烧写和地面站操作。
  links: 整机平台|/docs/manual/aircraft/，飞行控制|/docs/manual/autopilot/，通信链路|/docs/manual/datalink/，导航传感|/docs/manual/navigator/
- link: /docs/guide/
  name: 使用教程
  icon: 🚀
  desc: 从装机到首飞的完整路径：机架选择、传感器校准、链路连接、任务规划，以及 SITL / HITL 仿真训练与日志、参数等进阶操作。
  links: 快速上手|/docs/guide/quickstart/，飞控配置|/docs/guide/config/，飞行仿真|/docs/guide/simulation/sitl，进阶功能|/docs/guide/advanced/
- link: /docs/develop/
  name: 开发指南
  icon: 💻
  desc: 面向源码构建与二次开发：开发环境搭建、固件构建烧写、代码结构，以及 uORB / PARAM / AIRFRAME 扩展架构与模块开发。
  links: 飞控源码|https://github.com/nextpilot/nextpilot-flight-control，Windows 工具链|https://github.com/nextpilot/nextpilot-windows-toolchain
- link: /docs/community/
  name: 社区支持
  icon: 💬
  desc: 使用答疑与故障排查的第一站：扫码加群交流、提交 Issue，了解代码与文档的贡献流程、行为准则和许可协议。
  links: 技术支持|/docs/community/support，贡献指南|/docs/community/contribute，行为准则|/docs/community/code-of-conduct
```

:::

## NextPilot 开源项目

NextPilot 的开源项目围绕飞控核心、地面控制、模型设计和开发环境展开。

<div class="repo-grid">
  <article class="repo-card">
    <h3>NextPilot Flight Control <span class="repo-scope">通用飞控</span></h3>
    <p>基于 RT-Thread 实时操作系统、核心算法移植自 PX4 的自动驾驶仪，支持多旋翼、固定翼和垂起复合翼。</p>
    <p><a href="https://nextpilot.org/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/nextpilot/nextpilot-flight-control" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="/docs/manual/">产品手册</a> · <a href="/docs/develop/">开发指南</a></p>
  </article>
  <article class="repo-card">
    <h3>NextPilot Ground Control <span class="repo-scope">地面控制站</span></h3>
    <p>地面控制站，提供飞行监控、航线规划、飞前检查、日志回放和虚拟飞行仿真。</p>
    <p><a href="https://nextpilot.org/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/nextpilot/nextpilot-ground-control" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="/docs/guide/simulation/sitl">仿真文档</a> · <a href="/docs/develop/">开发指南</a></p>
  </article>
  <article class="repo-card">
    <h3>NextPilot Simulink Project <span class="repo-scope">模型设计与仿真</span></h3>
    <p>面向模型设计的 Simulink 工程，用于控制律开发以及 MIL / SIL 仿真验证。</p>
    <p><a href="https://nextpilot.org/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/nextpilot/nextpilot-simulink-project" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="/docs/guide/">使用教程</a> · <a href="/docs/develop/">开发指南</a></p>
  </article>
  <article class="repo-card">
    <h3>NextPilot Windows Toolchain <span class="repo-scope">开发工具链</span></h3>
    <p>Windows 开发工具链，用于在 Windows 环境下构建 NextPilot 飞控工程。</p>
    <p><a href="https://nextpilot.org/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/nextpilot/nextpilot-windows-toolchain" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="/docs/develop/">开发指南</a></p>
  </article>
</div>

## 主流开源飞控项目

下面列出无人系统开发中具有代表性的开源飞控项目，方便对比不同的技术路线、生态和文档资源。标题标签表示项目的主要适用范围；MAVLink 和 QGroundControl 属于飞控生态配套项目，不是飞控固件。项目归属其各自社区，排名不分先后。

<div class="repo-grid">
  <article class="repo-card">
    <h3>PX4 <span class="repo-scope">通用无人系统</span></h3>
    <p>面向学术研究、工程开发和商用无人系统的开源自动驾驶平台，拥有较完整的仿真、模块和开发者生态。</p>
    <p><a href="https://px4.io/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/PX4/PX4-Autopilot" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="https://docs.px4.io/main/en/" target="_blank" rel="noopener noreferrer">用户手册</a> · <a href="https://docs.px4.io/main/en/development/" target="_blank" rel="noopener noreferrer">开发指南</a></p>
  </article>
  <article class="repo-card">
    <h3>ArduPilot <span class="repo-scope">通用无人系统</span></h3>
    <p>成熟的开源自动驾驶平台，覆盖多旋翼、固定翼、车、船和潜器等多种载具类型。</p>
    <p><a href="https://ardupilot.org/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/ArduPilot/ardupilot" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="https://ardupilot.org/ardupilot/" target="_blank" rel="noopener noreferrer">用户手册</a> · <a href="https://ardupilot.org/dev/" target="_blank" rel="noopener noreferrer">开发指南</a></p>
  </article>
  <article class="repo-card">
    <h3>Betaflight <span class="repo-scope">竞速与特技多旋翼</span></h3>
    <p>面向竞速和特技多旋翼的开源飞控固件，强调低延迟飞行体验和丰富的飞行调参能力。</p>
    <p><a href="https://betaflight.com/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/betaflight/betaflight" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="https://betaflight.com/docs/wiki" target="_blank" rel="noopener noreferrer">用户手册</a> · <a href="https://betaflight.com/docs/development" target="_blank" rel="noopener noreferrer">开发指南</a></p>
  </article>
  <article class="repo-card">
    <h3>INAV <span class="repo-scope">导航型固定翼与多旋翼</span></h3>
    <p>面向导航飞行的开源飞控固件，适合固定翼、飞翼、垂直起降和多旋翼等模型平台。</p>
    <p><a href="https://inavflight.github.io/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/iNavFlight/inav" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="https://github.com/iNavFlight/inav/wiki" target="_blank" rel="noopener noreferrer">用户手册</a> · <a href="https://github.com/iNavFlight/inav/wiki/Development" target="_blank" rel="noopener noreferrer">开发指南</a></p>
  </article>
  <article class="repo-card">
    <h3>Paparazzi UAV <span class="repo-scope">研究与自主飞行</span></h3>
    <p>面向无人机研究和自主飞行的开源软硬件平台，提供飞控软件、地面工具和相关开发资料。</p>
    <p><a href="https://paparazziuav.org/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/paparazzi/paparazzi" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="https://paparazziuav.org/wiki/Getting_Started" target="_blank" rel="noopener noreferrer">用户手册</a> · <a href="https://paparazziuav.org/wiki/Development" target="_blank" rel="noopener noreferrer">开发指南</a></p>
  </article>
  <article class="repo-card">
    <h3>Rotorflight <span class="repo-scope">单旋翼直升机</span></h3>
    <p>基于 Betaflight 生态、面向单旋翼直升机模型的持续维护型开源飞控套件，提供直升机专用的姿态控制、调参和旋翼转速管理能力。</p>
    <p><a href="https://rotorflight.org/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/rotorflight/rotorflight" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="https://rotorflight.org/docs/" target="_blank" rel="noopener noreferrer">用户手册</a> · <a href="https://rotorflight.org/docs/Contributing/intro" target="_blank" rel="noopener noreferrer">开发指南</a></p>
  </article>
  <article class="repo-card">
    <h3>MAVLink <span class="repo-scope">通信协议</span></h3>
    <p>轻量级无人系统通信协议，用于飞控、地面站和机载组件之间交换状态、控制与任务数据。</p>
    <p><a href="https://mavlink.io/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/mavlink/mavlink" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="https://mavlink.io/en/guide/" target="_blank" rel="noopener noreferrer">用户手册</a> · <a href="https://mavlink.io/en/contributing/contributing.html" target="_blank" rel="noopener noreferrer">开发指南</a></p>
  </article>
  <article class="repo-card">
    <h3>QGroundControl <span class="repo-scope">地面控制站</span></h3>
    <p>跨平台开源地面控制站，支持飞行器连接、参数配置、任务规划、地图操作和飞行监控。</p>
    <p><a href="https://qgroundcontrol.com/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/mavlink/qgroundcontrol" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="https://docs.qgroundcontrol.com" target="_blank" rel="noopener noreferrer">用户手册</a> · <a href="https://dev.qgroundcontrol.com/" target="_blank" rel="noopener noreferrer">开发指南</a></p>
  </article>
</div>

## 参与开源

欢迎通过代码、文档、问题反馈和经验分享参与 NextPilot 社区。提交代码前请先阅读[贡献指南](/docs/community/contribute)，了解许可协议和协作流程。
