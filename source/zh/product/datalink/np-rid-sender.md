---
layout: product
order: 2
title: NP-RID-Sender
description: >-
  NP-RID-Sender 广播式无人机运行识别发射器，满足 GB 46750-2025 标准，
  支持 MAVLink/DroneCAN 协议连接飞控，通过 WiFi 或蓝牙广播无人机运行状态，
  适配 Ardupilot、PX4 等主流飞控，满足无人机飞行监管需求。
summary: 广播式无人机运行识别发射器，满足 GB 46750-2025，支持 MAVLink/DroneCAN，通过 WiFi/蓝牙广播运行状态
cover: /assets/images/product/datalink/np_rid_sender_board.png
gallery:
  - /assets/images/product/datalink/np_rid_sender_board.png
  - /assets/images/product/datalink/np_rid_sender_board2.png
shopUrl: https://item.taobao.com/item.htm?id=1074097497449&mi_id=0000KHD5urOB5ulWhlh0CZLkO54UwXlaqMXVS7sOhyvD7lY
helpUrl: /docs/manual/datalink/np-rid-sender
price: 120
---

## 产品详情

### 简介

NP-RID-Sender 是 NextPilot 推出的一款广播式无人机运行识别发射器，满足 GB 46750-2025 标准要求，可通过 WiFi 或蓝牙广播无人机运行状态信号，满足对无人机飞行监管需求。目前支持 MAVLink、DroneCAN 协议连接，支持的飞控有 Ardupilot、PX4 等，**如需要支持其他飞控或协议，可定制开发**。

目前提供 NP-RID-Sender-S3-GH 与 NP_S3_CMV2 两种硬件形态，后者为第二代板子，内置 USB Hub，只需一根 USB 线连接计算机即可完成参数配置。

### 产品功能

- 具备与飞控通信获取无人机运行状态的功能；
- 具备 WiFi 信标帧广播功能；
- 具备蓝牙 5 广播功能；
- 具备网页查看无人机状态功能；
- 具备 WiFi 数传功能，可将飞控数据透传至地面站；
- 具备虚拟 RID 模拟功能，无飞控时也可用于测试；
- 具备参数设置功能，可通过串口调试助手连接设备后，通过参数命令快速设置所有参数；
- 具备 OTA 升级功能，可通过网页上传并升级固件。

### 规格参数

- 支持主控芯片：ESP32-S3 / ESP32-C3；
- 接口：2 个串口**（含飞控串口、调试串口）**、1 个 USB、1 个 CAN；
- 支持输入协议：MAVLink、DroneCAN；
- 支持发射信号类型：WiFi 广播信标帧、蓝牙 5；
- 发射功率：20dBm；
- 发射协议：GB46750。

### 硬件形态

目前支持如下硬件：

- NP-RID-Sender-S3-GH
- NP_S3_CMV2（第二代板子）

<img src="/assets/images/product/datalink/np_rid_sender_board.png" alt="np_rid_sender_board" style="zoom: 67%;" />

::: info
第二代板子主要改进是增加 USB Hub，将 UART0 通过 USB 引出，直接通过 USB 连接计算机即可完成参数配置。
:::

### 接口说明

硬件外部接口如下图所示：

<img src="/assets/images/product/datalink/np_rid_receiver_interfaces.png" alt="np_rid_receiver_interfaces" style="zoom:80%;" />

详细说明如下表：

| 接口  | 引脚线序                   | 备注                                                                             |
| ----- | -------------------------- | -------------------------------------------------------------------------------- |
| USB   | USB，Type-C                | 板子内置 USB Hub，连接一路 USB 至计算机，即可看到两路 USB 转串口                 |
| UART1 | RX: GPIO17<br />TX: GPIO18 | **飞控串口**<br />默认波特率 115200<br />接插件标识为 J6                         |
| UART2 | RX: GPIO44<br />TX: GPIO43 | **调试串口**<br />用于调试、参数配置<br />默认波特率 115200<br />接插件标识为 J4 |
| CAN   | RX: GPIO38<br />TX: GPIO47 | 直接连接飞控 CAN 即可<br />接插件标识为 J5                                       |

### 尺寸大小

<img src="/assets/images/product/datalink/np_rid_NP_S3_CMV2_size.png" alt="np_rid_NP_S3_CMV2_size" style="zoom:50%;" />

## 资料下载

通过下面链接下载最新固件，并参考[用户手册进行 OTA 升级](../../docs/01-manual/datalink/np-rid-sender.md#ota-升级)。

| 板子                | 当前固件版本 | 点击下载                                                                 |
| ------------------- | ------------ | ------------------------------------------------------------------------ |
| NP-RID-Sender-S3-GH | V1.3         | [OTA 升级 app 固件](/assets/files/NP-RID-Sender-S3-GH-V1.3_OTA.bin)      |
| NP_S3_CMV2          | V1.3         | [OTA 升级 app 固件](/assets/files/NP-RID-Sender-NP_S3_CMV2-V1.3_OTA.bin) |

## 常见问题

1. 在地面站完成所有配置，仍然报错 Arm uninitialized：请确认是否开启了 RID 模拟，通过 `param set SIM_ON 0` 关闭模拟；
2. 通过 CAN 连接 PX4 时，网页中显示的产品标识码与 QGC 地面站设置的不同，而通过串口连接时二者一样：可能使用的 PX4 版本低于 v1.18，这之前的版本 PX4 的 DroneCAN `send_basic_id()` 把 `uas_id` 取自 MCU 序列号 / board UUID，而非 QGC 地面站的设置；
3. 通过 CAN 连接其他飞控后无法正常显示：首先确认飞控是否具备 CAN 节点自动分配功能，若不具备，需要通过命令手动分配节点，例如 `param set CAN_NODE 3`。

## 更新记录

### v1.0

初始版本，完成 RID 基础功能。

### v1.2

修复协议赋值错误，优化 WiFi 广播，增加时间同步功能。

### v1.3

增加对 NP_S3_CMV2 板子的支持，暴露 `CAN_NODE` 参数可由用户设置。
