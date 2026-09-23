---
layout: doc
order: 1
title: NP-RID-Receiver
description: >-
  NP-RID-Receiver 广播式无人机运行识别接收器，满足 GB 46750-2025 标准，
  支持 WiFi/蓝牙广播信号接收，最多同时接收50个无人机广播信号，
  可通过串口输出 MAVLink 或 GB46750 协议数据至监管软件系统。
summary: 广播式无人机运行识别接收器，满足GB 46750-2025，支持WiFi/蓝牙广播接收，串口输出MAVLink/GB46750协议
cover: /assets/images/product/datalink/NP-RID-Receiver-S3-PinWX.png
shopUrl: https://shop103678810.taobao.com/category.htm?spm=pc_detail.30350276.shop_block.dshopinfo.52f17dd6b1ptE2
---

# NP-RID-Receiver 运行识别接收器

## 产品简介

NP-RID-Receiver 是 NextPilot 推出的一款广播式无人机运行识别接收器，简称RID（RemoteID）接收设备，满足 GB 46750-2025 标准要求，支持 WiFi 信标帧及蓝牙广播信号接收和解析，最多可同时接收 50个无人机广播信号，可通过 USB 串口连接至监管软件系统，满足对无人机飞行监管需求。

该产品有如下几个特点：

- 串口输出数据协议可设置，支持MAVLink协议或JSON格式；
- 用户可通过网页查看已接收到的无人机运行标识、设备运行状态；
- 提供串口控制台，用户通过串口调试助手即可输入命令，实现参数设置、重启、任务运行状态监控；
- 支持 OTA 升级，可在官网下载最新固件，通过网页升级；
- 连接超级简单，只需一路USB（Type-C），即可实现供电、配置、数据接收。

购买连接：<https://item.taobao.com/item.htm?id=1080770176626&mi_id=0000I6qNljnOrxWQA_s_anzovO7YazA6_WVTqM4mrHshyjM>

视频教程：[NextPilot RID接收模块——01）产品使用介绍_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1Rutd6QE9X/?spm_id_from=333.337.search-card.all.click&vd_source=a660c07febe10a74810d29892179c73a)

官方文档：[产品手册 | NextPilot 让飞控更开放，让开发更高效，让设计更专注](https://nextpilot.org/docs/manual/)

### 产品功能

- 具备无人机广播数据接收能力，支持新国标 GB46750-2025；
- 具备数据输出能力，可通过串口输出，支持MAVLink协议或JSON格式；
- 支持地面站显示，可在QGC、NextPilot、MissionPlanner地面站显示无人机位置、状态信息；
- 具备 OTA 升级能力，可通过网页上传并升级固件；
- 具备参数设置能力，可通过调试串口快速设置参数，控制设备行为与功能。

### 硬件形态

产品硬件如下图所示：

<img src="/assets/images/product/datalink/NP-RID-Receiver-S3-PinWX.png" alt="NP-RID-Receiver-S3-PinWX" loading="lazy" />

## 技术参数

### 规格参数

- 主控芯片：ESP32-S3；
- 接口：1个 USB（含调试串口、数据输出串口）、2个22排针（2.54mm间距）；
- 支持接收信号类型：WIFI 广播信标帧、蓝牙5；
- 最大信号接收数量：50；
- 数据处理时间：≤20ms；
- 信号接收动态范围：≥74dB；
- 输出数据格式：MAVLink/JSON；
- 尺寸：≤62mm x 22mm；
- 重量：≤15g；

### 接口说明

产品主要包括如下几个接口：

- USB：通过 USB Hub 扩展了**两路串口**，用于查看运行状态、配置参数；
  - 调试串口：波特率 115200（不可改），输出设备运行状态，接收配置指令用于参数设置、重启等；
  - 数据输出串口：默认波特率 115200（可改），输出接收到的无人机广播信息，输出的数据协议格式（MAVLink或JSON）根据参数 CFG_PROTOCOL 确定；

- 排针：两路间距2.54排针对外引出所有引脚，根据实际情况使用。

## 快速使用

### 通过串口助手查看广播数据

产品出厂默认输出 JSON格式数据，连接RID设备USB至计算机，可直接通过串口助手查看无人机广播数据。

<img src="/assets/images/product/datalink/rid-receiver-json.png" alt="NP-RID-Receiver-S3-PinWX" loading="lazy" />

### 通过地面站显示广播数据

参考[选择输出协议](#选择输出协议)，设置串口输出为 MAVLink 协议，可直接通过地面站查看接收的广播数据并显示无人机的位置。

#### 设备连接

通过 Type-C USB 线，连接 RID 设备至计算机。若串口不可用，请查看是否安装驱动。[在这里下载 CH343 驱动](https://www.wch.cn/downloads/CH343SER_EXE.html)后重新测试。

#### 打开地面站

打开 QGC 或 Mission Planner 地面站，创建串口连接后一般选择第二个串口。成功接收到无人机广播信号后，会自动在地面站显示无人机信息。

### 通过网页查看数据

#### 设备连接

通过 Type-C USB 线，连接 RID 设备至计算机，USB 供电后 RID 设备自动创建 WiFi 热点，热点名 `NP-RID-Receiver`，密码 `nextpilot`。

#### 连接热点

通过笔记本连接该热点。默认上电后启动热点，如果已经关闭，需要设置参数 `WIFI_AP_ENABLE=1`，然后重启。

#### 网页说明

网页包括系统状态、无人机列表、参数说明、固件升级四个内容。其中：

- 系统状态：显示 RID 设备上电后的运行时间等信息；

- 无人机列表：显示了当前通过广播接收到的无人机信息；

- 参数说明：显示当前所有参数，关于参数具体说明请参考[参数汇总](#参数汇总)；
- 固件升级：可以升级程序以及网页，具体升级说明请参考[OTA 升级](#ota升级)。

<img src="/assets/images/product/datalink/rid-webui.png" alt="网页界面 1" loading="lazy" />

## 配置参数

一般第一路 USB 串口为调试串口（也叫控制台串口），可通过该串口与设备进行交互。通过**USB 串口**灵活设置参数进而控制设备运行逻辑，如设置数据输出串口、启动 WiFi 热点、启动打印信息，极大方便用户在使用过程中进行测试。

### 操作步骤

直接使用 Type-C 数据线，连接产品**USB 串口**至计算机，打开串口调试上位机软件（如 MobaXterm、JCom 等），选择端口号，设置波特率 115200。通过串口调试上位机输入相关命令即可进行参数查看、参数设置、设备重启等操作。

<img src="/assets/images/product/datalink/rid-serial-config.png" alt="串口配置" loading="lazy" />

### 常用命令

包括如下几类命令：

- 帮助命令：`help`
- 重启设备：`reboot`
- 参数命令：相关参数命令如下表所示

| 操作                 | 命令                       | 示例                                                                                                                                                          |
| -------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 查看所有参数         | `param list`               | 查看所有参数：`param list`                                                                                                                                    |
| 重置参数为出厂默认值 | `param reset`              | 重置参数：`param reset`                                                                                                                                       |
| 查看指定参数         | `param get [name]`         | 查看数据输出串口波特率：`param get CFG_BAUD`                                                                                                                  |
| 设置参数             | `param set [name] [value]` | 关闭 WiFi 热点：`param set WIFI_AP_ENABLE 0`<br />设置输出协议为 MAVLink：`param set CFG_PROTOCOL 1`<br />设置数据输出串口波特率：`param set CFG_BAUD 115200` |

::: warning
**注意，命令后面必须加回车才有效！！！**
:::

### 参数汇总

所有参数说明如下表：

| 参数            | 描述                                                         | 备注                                                         |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| WIFI_AP_ENABLE  | 开启/关闭 WiFi 热点功能<br />0：关闭<br />1：开启（**默认**） | WiFi 热点开启（AP 模式）后无法接收广播数据（蓝牙一直可以接收广播数据），出厂默认开启，方便用户监控产品运行状态。<br />如需使用 WiFi 接收，请在 |
| CFG_UART        | 选择数据输出串口<br />1：UART1（**默认**）<br />2：UART2     | 只能设置为 1 或 2                                            |
| CFG_BAUD        | 串口波特率，（**默认**115200）                               |                                                              |
| CFG_PROTOCOL    | 数据输出协议格式<br />1：MAVLink，HEARTBEAT、GPS_RAW_INT、OpenDroneID 相关消息<br />2：JSON（**默认**） | 配置为MAVLink协议输出后，可将RID设备通过USB连接地面站（如PX4、NextPilot等），可将接收到的无人机位置显示在地图上；<br />配置为JSON格式输出后，可在串口上位机以字符文本显示收到的无人机数据，方便人工查看。 |
| DBG_BT_OPTION   | 蓝牙接收调试选项<br />0：不通过串口输出调试信息（**默认**）<br />1：通过串口打印 AD Structure 信息（广播者 MAC、SID、RSSI、数据包长度等） | 默认通过调试串口打印，根据这些可快速查看周围蓝牙信号源信息   |
| DBG_WIFI_OPTION | WiFi接收调试选项<br />0：不通过串口输出调试信息（**默认**）<br />1：通过串口打印Beacon信息（广播者 MAC、RSSI、数据包长度等） | 默认通过调试串口打印，根据这些可快速查看周围WiFi信号源信息   |
| DBG_DS_OPTION   | 接收到的无人机状态数据调试选项<br />0：不通过串口输出调试信息（**默认**）<br />1：打印无人机身份信息，包括唯一识别标识码、实名登记、运行类别、分类、运行状态<br />2：打印遥控站信息，<br />4：打印无人机位置信息，包括时间戳、坐标类别、经纬度、航迹角、地速、相对高度、大地高度、气压高度<br />8：打印精度信息，包括水平位置精度、垂直精度、速度精度、时间精度 | 默认通过调试串口打印，根据这些可快速查看周围无人机广播信息。如果需要显示多组信息，只需要将对于数字相加即可，例如 3=1+2，表示会打印无人机身份信息+遥控站信息 |

常用配置如下：

```bash
# 关闭WiFi热点：
param set WIFI_AP_ENABLE 0
# 开启WiFi热点：
param set WIFI_AP_ENABLE 1
# 设置输出协议为MAVLink
param set CFG_PROTOCOL 1
# 设置输出协议为JSON
param set CFG_PROTOCOL 2
# 设置数据输出串口波特率
param set CFG_BAUD 115200
```

## 高级功能

### 启动 WiFi 广播接收

产品出厂默认开启蓝牙接收以及WiFi热点用于网页查看与配置，故无法接收WiFi 广播数据。要打开WiFi广播数据接收功能，必须要先关闭 WiFi 热点。

相关操作如下：

- 关闭 WiFi 热点（关闭 WiFi 热点，重启后将接收 WiFi 广播信号）：`param set WIFI_AP_ENABLE 0`

- 开启 WiFi 热点（开启 WiFi 热点后，将无法通过网页查看状态）：`param set WIFI_AP_ENABLE 1`

### 选择输出协议

支持如下几种数据协议格式输出：

- MAVLink 协议：将收到的每个无人机数据转成一个对应的无人机实例，这样可在地面站同时显示多个无人机位置消息，详细请参考[MAVLINK Common Message Set (common.xml) | MAVLink Guide](https://mavlink.io/zh/messages/common.html)；设置命令如下：

  ```bash
  param set CFG_PROTOCOL 1
  ```

- JSON格式：**默认**，以字符串格式输出，可读性强；设置命令如下：

  ```bash
  param set CFG_PROTOCOL 2
  ```

::: tip
由于中国国标协议内容与 MAVLink 协议内容并不完全一致，故为了能够通过 MAVLink 输出，需要借用 MAVLink 消息字段进行传输，稍微不同的几个字段对应如下表：

| 消息                           | 原始字段            | 映射 GB 后的含义  |
| ------------------------------ | ------------------- | ----------------- |
| OPEN_DRONE_ID_LOCATION (12901) | status              | 运行状态          |
| OPEN_DRONE_ID_BASIC_ID (12900) | uas_id              | 实名登记号后 8 尾 |
| OPEN_DRONE_ID_SYSTEM (12904)   | classification_type | 无人机分类        |
|                                | category_eu         | 运行类别          |

:::

## OTA 升级

### 下载固件

| 板子                     | 当前固件版本 | 点击下载                                                     |
| ------------------------ | ------------ | ------------------------------------------------------------ |
| NP-RID-Receiver-S3-PinWX | V1.2         | [OTA 升级 app 固件](/assets/files/NP-RID-Receiver-S3-PinWX-V1.2_app.bin)<br />[OTA 升级网页固件](/assets/files/NP-RID-Receiver-S3-PinWX-V1.2_www.bin) |

### 连接热点

启动 WiFi 热点后，通过笔记本连接该热点（热点名 `NP-RID-Receiver`，密码 `nextpilot`）。默认上电后启动热点，如果已经关闭，需要设置参数 `WIFI_AP_ENABLE=1`，然后重启。

### 升级固件

连接热点后，在浏览器输入<http://192.168.4.1>，在最下方**固件(app)**下点击选择文件。

<img src="/assets/images/product/datalink/rid-ota-app.png" alt="OTA 升级 app" loading="lazy" />

在打开的对话框中选择下载的 `app.bin` 固件，然后点击`更新固件`。

更新完成后会自动重启！

### 升级网页

在**网页(www)**下点击选择文件，选择下载的 `www.bin` 文件，然后点击`更新网页`，更新成功后刷新网页即可。

## 常见问题

1. 默认开启 WiFi 热点，如需要关闭，请通过参数设置（`WIFI_AP_ENABLE=0`）；
2. 开启 WiFi 热点后，但只可通过蓝牙接收外部无人机广播数据，将无法继续接收 WiFi 广播信息；
3. 如要进行 OTA 升级，确保 WiFi 热点已打开（`WIFI_AP_ENABLE=1`）、开启 OTA（`OTA_ENABLE=1`）；
4. 如果没有接收到RID广播，请依次排查：
   - 是否无人机RID广播仅支持WiFi，要想接收WiFi广播，请关闭WiFi热点（param set WIFI_AP_ENABLE 0）；
   - 如果还没有RID数据，可以通过设置调试参数（param set DBG_WIFI_OPTION 1），根据打印信息查看是否接收到WiFi广播数据报文，如MAC地址、RSSI、数据包长度；
