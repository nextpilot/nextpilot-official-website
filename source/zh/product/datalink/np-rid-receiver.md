---
layout: product
order: 1
title: NP-RID-Receiver
description: >-
  NP-RID-Receiver 广播式无人机运行识别接收器，满足 GB 46750-2025 标准，
  支持 WiFi/蓝牙广播信号接收，最多同时接收50个无人机广播信号，
  可通过串口输出 MAVLink 或 GB46750 协议数据至监管软件系统。
summary: 广播式无人机运行识别接收器，满足GB 46750-2025，支持WiFi/蓝牙广播接收，串口输出MAVLink/GB46750协议
cover: /assets/images/product/datalink/NP-RID-Receiver-S3-PinWX.png
shopUrl: https://item.taobao.com/item.htm?id=1080770176626&mi_id=0000I6qNljnOrxWQA_s_anzovO7YazA6_WVTqM4mrHshyjM
helpUrl: /docs/manual/datalink/np-rid-receiver
price: 199
---

## 产品详情

### 简介

NP-RID-Receiver 是 NextPilot 推出的一款广播式无人机运行识别接收器，满足 GB 46750-2025 标准要求，支持 WiFi 信标帧及蓝牙广播信号接收和解析，最多可同时接收 50个无人机广播信号，可通过 USB 串口连接至监管软件系统，满足对无人机飞行监管需求。

### 产品功能

- 具备无人机广播数据接收能力，支持新国标 GB46750-2025；
- 具备数据输出能力，可通过串口输出，支持[GB 46750](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=56E7666BF313B2F51A747F2BEEE4F896)、[MAVLink](https://mavlink.io/zh/messages/common.html)或JSON；
- 支持地面站显示，可在QGC、NextPilot、MissionPlanner地面站显示无人机位置、状态信息；
- 用户可通过网页查看已接收到的无人机运行标识、设备运行状态；
- 具备 OTA 升级能力，可通过网页上传并升级固件；
- 具备参数设置能力，可通过调试串口快速设置参数，控制设备行为与功能。
- 连接超级简单，只需一路USB，即可实现供电、配置、数据接收。

::: tip
由于中国国标协议内容与 MAVLink 协议内容并不完全一致，故为了能够通过 MAVLink 输出，需要借用 MAVLink 消息字段进行传输，稍微不同的几个字段对应如下表：

| 消息                           | 原始字段            | 映射 GB 后的含义  |
| ------------------------------ | ------------------- | ----------------- |
| OPEN_DRONE_ID_LOCATION (12901) | status              | 运行状态          |
| OPEN_DRONE_ID_BASIC_ID (12900) | uas_id              | 实名登记号后 8 尾 |
| OPEN_DRONE_ID_SYSTEM (12904)   | classification_type | 无人机分类        |
|                                | category_eu         | 运行类别          |

:::

### 规格参数

- 主控芯片：ESP32-S3；
- 接口：2个串口、1个 USB、1个 CAN；
- 支持接收信号类型：WIFI 广播信标帧、蓝牙5；
- 最大信号接收数量：50；
- 数据处理时间：≤20ms；
- 信号接收动态范围：≥74dB；
- 输出数据格式：GB46750/MAVLink/JSON；

### 接口说明

NP-RID-Receiver-S3-PinWX，设备主要包括如下几个接口：

- USB：通过 USB Hub 扩展了**两路串口**，用于查看运行状态、配置参数；
  - 调试串口：波特率 115200（不可改），输出设备运行状态，接收配置指令用于参数设置、重启等；
  - 数据输出串口：默认波特率 115200（可改），输出接收到的无人机广播信息，数据协议根据参数 CFG_PROTOCOL 确定；
- 排针：两路排针对外引出所有引脚，根据实际情况选用。

### 硬件形态

目前支持如下几款硬件：

- NP-RID-Receiver-S3-PinWX

| 硬件外观                                                                                                                 | 硬件名称                 | 说明                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="/assets/images/product/datalink/NP-RID-Receiver-S3-PinWX.png" alt="NP-RID-Receiver-S3-PinWX" loading="lazy" /> | NP-RID-Receiver-S3-PinWX | 主控芯片：ESP32-S3<br />可连接外置天线<br />一个 USB 扩展两路串口，分别用于调试参数配置串口、数据输出串口<br />所有引脚通过排针对外引出，方便进行扩展与二次开发 |

## 技术参数

## 资料下载

通过下面链接最新固件，并参考[用户手册进行OTA升级](../../docs/01-manual/datalink/np-rid-receiver.md#ota-%E5%8D%87%E7%BA%A7)。

| 板子                     | 当前固件版本 | 点击下载                                                                                                                                              |
| ------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| NP-RID-Receiver-S3-PinWX | V1.0         | [OTA 升级 app 固件](/assets/files/NP-RID-Receiver-S3-PinWX-V1.0_app.bin)<br />[OTA 升级网页固件](/assets/files/NP-RID-Receiver-S3-PinWX-V1.0_www.bin) |
|                          |              |                                                                                                                                                       |

## 常见问题

1. 默认开启 WiFi 热点，如需要关闭，请设置（WIFI_AP_ENABLE=0）；
2. 开启 WiFi 热点后，但只可通过蓝牙接收外部无人机广播数据，将无法继续接收 WiFi 广播信息；
3. 如要进行 OTA 升级，确保 WiFi 热点已打开（WIFI_AP_ENABLE=1）、开启 OTA（OTA_ENABLE=1）；

## 更新记录
