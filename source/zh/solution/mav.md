---
order: 4
title: MAVLink协议定制开发
description: MAVLink 协议定制开发，从协议层私有化到 SDK 封装，构建安全高效的无人机通信体系。
summary: |
  从协议层私有化到 SDK 封装，构建安全、高效的无人机通信体系。
  - MAVLink 帧头/校验私有化定制
  - 帧内容加密解密与密钥管理
  - MAVSDK 跨平台 SDK 定制封装
  - 自定义消息与 API 接口定制
cover: /assets/images/solution/mavlink.png
---

# MAVLink 协议定制开发

> MAVLink、MAVSDK、QGroundControl 均由 MAVLink 开源团队贡献并维护。

## MAVLink 定制开发

<img src="/assets/images/solution/mavlink.png" alt="" loading="lazy" />

MavLink（Micro Air Vehicle Link）是一种用于小型无人载具的通信协议，于 2009年首次发布。该协议广泛应用于地面站（Ground Control Station，GCS）与无人载具（Unmanned vehicles）之间的通信，同时也应用在载具内部子系统的内部通信中，协议以消息库的形式定义了参数传输的规则。MavLink 协议支持无人固定翼飞行器、无人旋翼飞行器、无人车辆等多种载具。

NextPilot 团队提供 MAVLink 定制开发包括：

- MAVLink 协议介绍，帧结构定义等
- 如何使用 MAVLink 库，包括 MAVLink 现有的微服务框架
- 如何定义 MAVLink 消息，如何生成 MAVLink 代码等
- 如何使用 MAVROS、MAVProxy 等
- **如何使用 Wireshark 调试 MAVLink**
- 在地面站和飞控中集成 MAVLink
- **修改 MAVLink 帧头、校验方法等，私有化定制**
- **MAVLink 帧内容加密、解密，和秘钥管理等**

## MAVSDK 定制开发

<img src="/assets/images/solution/mavsdk.png" alt="" loading="lazy" />

​MAVSDK 是基于 MAVLink 通信协议的用于无人机应用开发的 SDK，通过 MAVSDK 可以快速实现飞控连接、飞控数据获取、飞行控制，帮助开发者快速部署解决方案。​其可以部署在 Windows、Linux、Android 等多种平台，并且支持多种语言如 c/c++、python、Java 等。

::: note
使用 MAVSDK 可以帮助客户隐藏通信细节，提高用户使用便捷性，也提高了通信的安全性和私密性。MAVSDK 可以用于 `机载任务计算机和飞控通信`，也可以用于 `地面站和第三方程序解析通信协议`。
:::

​NextPilot 团队提供 MAVSDK 定制开发，包括：

- MAVSDK 开发环境搭建，生成动态库，以及如何使用等；
- MSG 消息定制：根据客户需求，定制 MAVLink 消息，增加消息接收解析；
- API 接口定制：根据客户需要，修改已有或增加 API 接口；
- MAVSDK 重命名：根据客户实际需求，更改名称并创建客户自己的 SDK 库。
