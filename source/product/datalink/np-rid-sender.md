---
layout: product
order: 2
title: NP-RID-Sender
description: >-
  NP-RID-Sender 广播式无人机运行识别发射器，满足 GB 46750-2025 标准，
  支持 MAVLink/DroneCAN 协议连接飞控，通过 WiFi 或蓝牙广播无人机运行状态，
  适配 Ardupilot、PX4 等主流飞控，满足无人机飞行监管需求。
summary: 广播式无人机运行识别发射器，满足GB 46750-2025，支持MAVLink/DroneCAN，通过WiFi/蓝牙广播运行状态
cover: /assets/images/product/datalink/np-rid-sender-gh-board.png
gallery:
  - /assets/images/product/datalink/np-rid-sender-gh-board.png
  - /assets/images/product/datalink/np-rid-sender-gh-appearance.png
shopUrl: https://item.taobao.com/item.htm?id=1074097497449&mi_id=0000KHD5urOB5ulWhlh0CZLkO54UwXlaqMXVS7sOhyvD7lY
helpUrl: /manual/datalink/np-rid-sender
price: 120
---

## 产品详情

### 简介

NP-RID-Sender 是 NextPilot 推出的一款广播式无人机运行识别发射器，满足 GB 46750-2025 标准要求，可通过 WiFi 或蓝牙广播无人机运行状态信号，满足对无人机飞行监管需求。目前支持 MAVLink、DroneCAN 协议连接，支持的飞控有 Ardupilot、PX4 等，**如需要支持其他飞控或协议，可定制开发**。

### 产品功能

- 具备与飞控通信获取无人机运行状态的功能；
- 具备 WiFi 信标帧广播功能；
- 具备蓝牙5 广播功能；
- 具备网页查看无人机状态功能；
- 具备WiFi数传功能；
- 具备虚拟 RID 模拟功能；
- 具备参数设置功能，可通过串口调试助手连接设备后，通过参数命令快速设置所有参数！
- 具备 OTA 升级功能；

### 规格参数

- 支持主控芯片：ESP32-S3/ESP32-C3；
- 接口：2个串口**（含飞控串口、调试串口）**、1个 USB、1个 CAN；
- 支持输入协议：MAVLink、DroneCAN；
- 支持发射信号类型：WIFI 广播信标帧、蓝牙5；
- 发射功率：20dBm；
- 发射协议：GB46750；

### 硬件形态

目前支持如下几款硬件：

- NP-RID-Sender-S3-GH
- NP-RID-Sender-C3-PinMini

| 硬件外观                                                                                                                 | 硬件名称                 | 说明                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| <img src="/assets/images/product/datalink/np-rid-sender-gh-board.png" alt="NP-RID-Sender-S3-GH" loading="lazy" />        | NP-RID-Sender-S3-GH      | 主控芯片：ESP32-S3<br />具备所有功能，可直接安装至无人机<br />连接外置天线<br />调试串口为 UART2         |
| <img src="/assets/images/product/datalink/np-rid-sender-c3-pinmini.png" alt="NP-RID-Sender-C3-PinMini" loading="lazy" /> | NP-RID-Sender-C3-PinMini | 主控芯片：ESP32-C3<br />无外置天线、只支持蓝牙不支持 WiFi 广播，一般用于测试使用。<br />调试串口为 UART0 |

## 技术参数

### NP-RID-Sender-S3-GH

各硬件外部接口说明如下表：

| 接口  | 引脚线序                   | 备注                                                                                                            |
| ----- | -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| USB   | USB，Type-C                | 插入计算机后会发现两路 USB 设备，第一路为 JTAG（程序下载与调试），第二路为串口转 USB（UART0），需要安装串口驱动 |
| UART1 | RX: GPIO17<br />TX: GPIO18 | **飞控串口**<br />默认波特率 115200<br />接插件为 J6                                                            |
| UART2 | RX: GPIO44<br />TX: GPIO43 | **调试串口**<br />用于调试、参数配置，通过 USB 的第二路串口访问<br />默认波特率 115200<br />接插件为 J4         |
| CAN   | RX: GPIO38<br />TX: GPIO47 | 直接连接飞控 CAN 即可                                                                                           |

### NP-RID-Sender-C3-PinMini

各硬件外部接口说明如下表：

| 接口  | 引脚线序                   | 备注                                                        |
| ----- | -------------------------- | ----------------------------------------------------------- |
| USB   | USB，Type-C                | 程序下载与调试，JTAG                                        |
| UART0 | RX: GPIO20<br />TX: GPIO21 | **调试串口**<br />用于调试、参数配置<br />默认波特率 115200 |
| UART1 | RX: GPIO2<br />TX: GPIO3   | **飞控串口**<br />默认波特率 115200                         |
| CAN   | RX: GPIO4<br />TX: GPIO5   | 需要外接 CAN 驱动器才可以使用                               |

## 资料下载

| 板子                     | 当前固件版本 | 点击下载                                                                 |
| ------------------------ | ------------ | ------------------------------------------------------------------------ |
| NP-RID-Sender-S3-GH      | V1.1         | [OTA 升级 app 固件](/assets/files/NP-RID-Sender-S3-GH-V1.1_OTA.bin)      |
| NP-RID-Sender-C3-PinMini | V1.0         | [OTA 升级 app 固件](/assets/files/NP-RID-Sender-C3-PinMini-V1.0_OTA.bin) |

## 常见问题

## 更新记录
