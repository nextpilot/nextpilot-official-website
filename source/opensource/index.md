---
layout: home
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

## GitHub 仓库

<div class="repo-grid">
  <a class="repo-card" href="https://github.com/nextpilot/nextpilot-flight-control" target="_blank" rel="noopener noreferrer">
    <h3>nextpilot-flight-control</h3>
    <p>国产开源先进自动驾驶仪，基于 RT-Thread 实时操作系统，核心算法移植自 PX4，支持多旋翼、固定翼、垂起复合翼。</p>
  </a>
  <a class="repo-card" href="https://github.com/nextpilot/nextpilot-simulink-project" target="_blank" rel="noopener noreferrer">
    <h3>nextpilot-simulink-project</h3>
    <p>Simulink 模型工程，支持基于模型设计（MBD），用于控制律算法开发与 MIL/SIL 仿真验证。</p>
  </a>
  <a class="repo-card" href="https://github.com/nextpilot/nextpilot-ground-control" target="_blank" rel="noopener noreferrer">
    <h3>nextpilot-ground-control</h3>
    <p>地面控制站（GCS），提供飞行监控、航线规划、飞前检查、日志回放与虚拟飞行仿真。</p>
  </a>
  <a class="repo-card" href="https://github.com/nextpilot/nextpilot-windows-toolchain" target="_blank" rel="noopener noreferrer">
    <h3>nextpilot-windows-toolchain</h3>
    <p>Windows 开发工具链，用于在 Windows 环境下编译 NextPilot 飞控工程。</p>
  </a>
</div>
