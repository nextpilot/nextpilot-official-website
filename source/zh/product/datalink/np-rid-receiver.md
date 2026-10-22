---
layout: product
order: 1
title: NP-RID-Receiver
description: >-
  NP-RID-Receiver 广播式无人机运行识别接收器，满足 GB 46750-2025 标准，
  支持 WiFi/蓝牙广播信号接收，最多同时接收 50 个无人机广播信号，
  可通过串口输出 MAVLink 或 GB46750 协议数据至监管软件系统。
summary: 广播式无人机运行识别接收器，满足 GB 46750-2025，支持 WiFi/蓝牙广播接收，串口输出 MAVLink/GB46750 协议
cover: /assets/images/product/datalink/np_rid_receiver_boards_support.png
shopUrl: https://item.taobao.com/item.htm?id=1080770176626&mi_id=0000I6qNljnOrxWQA_s_anzovO7YazA6_WVTqM4mrHshyjM
helpUrl: /docs/manual/datalink/np-rid-receiver
price: 199
---

## 产品详情

### 简介

NP-RID-Receiver 是 NextPilot 推出的一款广播式无人机运行识别接收器，简称 RID（RemoteID）接收设备，满足 GB 46750-2025 标准要求，支持 WiFi 信标帧及蓝牙广播信号接收和解析，最多可同时接收 50 个无人机广播信号，可通过 USB 串口连接至监管软件系统，满足对无人机飞行监管需求。

目前提供 NP_S3_CMV2、WX_S3_WRU、WX_S3_WR 三种硬件形态，接口与天线形式不同，可按安装空间和集成方式选型。

### 产品功能

- 具备无人机广播数据接收能力，支持新国标 GB46750-2025；
- 具备数据输出能力，可通过串口输出，支持 [MAVLink](https://mavlink.io/zh/messages/common.html) 协议或 JSON 格式；
- 支持一路或多路串口同时输出，适配多设备接入场景；
- 支持地面站显示，可在 QGC、NextPilot、MissionPlanner 地面站显示无人机位置、状态信息；
- 用户可通过网页查看已接收到的无人机运行标识、设备运行状态；
- 具备 OTA 升级能力，可通过网页上传并升级固件；
- 具备参数设置能力，可通过调试串口快速设置参数，控制设备行为与功能；
- 连接超级简单，只需一路 USB（Type-C），即可实现供电、配置、数据接收。

::: tip
由于中国国标协议内容与 MAVLink 协议内容并不完全一致，故为了能够通过 MAVLink 协议输出，需要借用 MAVLink 消息字段进行传输，稍微不同的几个字段对应如下表：

| 消息                           | 原始字段            | 映射 GB 后的含义  |
| ------------------------------ | ------------------- | ----------------- |
| OPEN_DRONE_ID_LOCATION (12901) | status              | 运行状态          |
| OPEN_DRONE_ID_BASIC_ID (12900) | uas_id              | 实名登记号后 8 尾 |
| OPEN_DRONE_ID_SYSTEM (12904)   | classification_type | 无人机分类        |
|                                | category_eu         | 运行类别          |

:::

### 规格参数

- 主控芯片：ESP32-S3；
- 支持接收信号类型：WiFi 广播信标帧、蓝牙 5；
- 最大同时接收数量：50 架；
- 数据处理时间：≤20ms；
- 信号接收动态范围：≥74dB；
- 输出数据格式：MAVLink / JSON；
- 硬件形态：NP_S3_CMV2、WX_S3_WRU、WX_S3_WR。

### 硬件形态

三种硬件板子的外观对比：

<img src="/assets/images/product/datalink/np_rid_receiver_boards_support.png" alt="np_rid_receiver_boards_support" style="zoom:80%;" />

| 硬件板子 | NP_S3_CMV2                                                      | WX_S3_WRU                                                        | WX_S3_WR                                                                                  |
| -------- | --------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 尺寸     | 37 × 27mm                                                       | 59.7 × 21.8mm                                                    | 59.7 × 21.8mm                                                                             |
| 重量     | 15g                                                             | 12g                                                              | 12g                                                                                       |
| 接口     | 1 路 USB、3 路串口、1 路 CAN、1 个 LED、1 个 IPEX、1 个 MMCX    | 1 路 USB、1 个 LED、2.54 双排针引出所有引脚                      | 1 路 USB、1 个 LED、2.54 双排针引出所有引脚                                               |
| 特点     | 串口与 CAN 通过 GH1.25 端子引出，连接方便；两种射频接口灵活选择 | 所有引脚通过排针引出，方便二次集成与开发；外置天线，接收灵敏度高 | 所有引脚通过排针引出，方便二次集成与开发；板载天线，占用空间小；尺寸接口与 WX_S3_WRU 一致 |

### 接口说明

**各硬件通用接口：**

- USB：通过 USB Hub 扩展出**两路串口**，用于查看运行状态、配置参数；
  - 第一路调试口：波特率 115200（不可改），输出设备运行状态，接收配置指令用于参数设置、重启等；
  - 第二路 UART0 串口：默认波特率 115200（可改），可配置为数据输出串口，输出接收到的无人机广播信息，协议格式由参数 `CFG_PROTOCOL` 决定。

**NP_S3_CMV2：**

- 串口：UART1（J6）、UART2（J4），GH1.25 端子；
- CAN：预留，GH1.25 端子；
- 射频：1 个 IPEX、1 个 MMCX 两种接口。

<img src="/assets/images/product/datalink/np_rid_receiver_interfaces.png" alt="np_rid_receiver_interfaces" style="zoom:80%;" />

**WX_S3_WRU / WX_S3_WR：**

- 排针：两路间距 2.54 排针对外引出所有引脚，根据实际情况使用。

### 尺寸大小

**NP_S3_CMV2：**

<img src="/assets/images/product/datalink/np_rid_NP_S3_CMV2_size.png" alt="np_rid_NP_S3_CMV2_size" style="zoom:80%;" />

**WX_S3_WRU / WX_S3_WR：**

<img src="/assets/images/product/datalink/np_rid_WX_size.png" alt="np_rid_WX_size" style="zoom: 50%;" />

## 资料下载

通过下面链接下载最新固件，并参考[用户手册进行 OTA 升级](../../docs/01-manual/datalink/np-rid-receiver.md#ota-升级)。

| 板子                  | 当前固件版本 | 点击下载                                                                                                                                              |
| --------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| WX_S3_WR 及 WX_S3_WRU | V1.2         | [OTA 升级 app 固件](/assets/files/NP-RID-Receiver-S3-PinWX-V1.2_app.bin)<br />[OTA 升级网页固件](/assets/files/NP-RID-Receiver-S3-PinWX-V1.2_www.bin) |
| NP_S3_CMV2            | —            | —                                                                                                                                                     |

## 常见问题

1. 默认开启 WiFi 热点，如需要关闭，请设置参数 `WIFI_ENABLE=0`；
2. 开启 WiFi 热点后，只能通过蓝牙接收外部无人机广播数据，将无法继续接收 WiFi 广播信息；
3. 如需接收 WiFi 广播数据，必须先关闭 WiFi 热点（`param set WIFI_ENABLE 0`）；
4. 如要进行 OTA 升级，确保 WiFi 热点已打开（`WIFI_ENABLE=1`）、开启 OTA（`OTA_ENABLE=1`）；
5. 未接收到 RID 广播时，可通过 `param set DBG_WIFI_OPTION 1` 查看是否收到 WiFi 广播报文（MAC 地址、RSSI、数据包长度）；
6. DJI 无人机默认通过 WiFi 广播，需关闭 WiFi 热点开启 WiFi 接收（`WIFI_ENABLE=0`）。

## 更新记录

### v1.0

初始版本，完成 RID 接收基础功能。

### v1.2

修复数据单位异常问题。

### v1.3

增加 NP_S3_CMV2 硬件板子。
