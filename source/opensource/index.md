---
layout: home
order: 5
title: 开源项目
description: NextPilot 开源项目集合，涵盖飞控系统、地面控制站、仿真工程与开发工具链。

hero:
  name: 开源项目
  tagline: 涵盖飞控系统、地面站、仿真与工具链的开源项目集合
  actions:
    - theme: brand
      text: 飞行仿真
      link: /opensource/guide/simulation/sitl
    - theme: brand
      text: 用户手册
      link: /opensource/guide/
    - theme: brand
      text: 开发指南
      link: /opensource/develop/
    - theme: brand
      text: 社区支持
      link: /opensource/community/

features:
  - title: 飞行仿真
    details: 不需要硬件，NextPilot-Ground-Control 地面控制站集成了虚拟飞行仿真功能。在地面控制站中创建一个虚拟飞机链接，即可立即开始飞行。
    link: /opensource/guide/simulation/sitl
    linkText: 查看文档
  - title: 用户手册
    details: NextPilot 飞控系统的用户手册，涵盖装机、配置、飞行操作与数据分析。
    link: /opensource/guide/
    linkText: 查看文档
  - title: 开发指南
    details: 飞控开发与二次开发指南，了解代码结构、贡献流程与开发环境搭建。
    link: /opensource/develop/
    linkText: 查看文档
  - title: 社区支持
    details: 获取技术支持、参与社区讨论与代码贡献。
    link: /opensource/community/
    linkText: 查看文档
---

## NextPilot 开源项目

NextPilot 的开源项目围绕飞控核心、地面控制、模型设计和开发环境展开。NextPilot 文档分为两类：面向装机、配置和日常使用的[用户手册](/opensource/guide/)，以及面向源码构建、二次开发和社区协作的[开发指南](/opensource/develop/)。

<div class="repo-grid">
  <article class="repo-card">
    <h3>NextPilot Flight Control <span class="repo-scope">通用飞控</span></h3>
    <p>基于 RT-Thread 实时操作系统、核心算法移植自 PX4 的自动驾驶仪，支持多旋翼、固定翼和垂起复合翼。</p>
    <p><a href="https://nextpilot.org/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/nextpilot/nextpilot-flight-control" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="/opensource/guide/">用户手册</a> · <a href="/opensource/develop/">开发指南</a></p>
  </article>
  <article class="repo-card">
    <h3>NextPilot Ground Control <span class="repo-scope">地面控制站</span></h3>
    <p>地面控制站，提供飞行监控、航线规划、飞前检查、日志回放和虚拟飞行仿真。</p>
    <p><a href="https://nextpilot.org/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/nextpilot/nextpilot-ground-control" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="/opensource/guide/06-simulation/01-sitl">用户手册</a> · <a href="/opensource/develop/">开发指南</a></p>
  </article>
  <article class="repo-card">
    <h3>NextPilot Simulink Project <span class="repo-scope">模型设计与仿真</span></h3>
    <p>面向模型设计的 Simulink 工程，用于控制律开发以及 MIL / SIL 仿真验证。</p>
    <p><a href="https://nextpilot.org/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/nextpilot/nextpilot-simulink-project" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="/opensource/guide/">用户手册</a> · <a href="/opensource/develop/">开发指南</a></p>
  </article>
  <article class="repo-card">
    <h3>NextPilot Windows Toolchain <span class="repo-scope">开发工具链</span></h3>
    <p>Windows 开发工具链，用于在 Windows 环境下构建 NextPilot 飞控工程。</p>
    <p><a href="https://nextpilot.org/" target="_blank" rel="noopener noreferrer">项目主页</a> · <a href="https://github.com/nextpilot/nextpilot-windows-toolchain" target="_blank" rel="noopener noreferrer">代码仓库</a> · <a href="/opensource/guide/">用户手册</a> · <a href="/opensource/develop/">开发指南</a></p>
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

欢迎通过代码、文档、问题反馈和经验分享参与 NextPilot 社区。提交代码前请先阅读[贡献指南](/opensource/community/contribute)，了解许可协议和协作流程。
