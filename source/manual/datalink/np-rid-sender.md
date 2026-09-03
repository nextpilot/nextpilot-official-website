---
layout: doc
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
---

## 产品说明

### 简介

NP-RID-Sender 是 NextPilot 推出的一款广播式无人机运行识别发射器，满足 GB 46750-2025 标准要求，可通过 WiFi 或蓝牙广播无人机运行状态信号，满足对无人机飞行监管需求。目前支持 MAVLink、DroneCAN 协议连接，支持的飞控有 Ardupilot、PX4 等，**如需要支持其他飞控或协议，可定制开发**。

购买途径：[首页-NextPilot-淘宝网](https://shop103678810.taobao.com/category.htm?spm=pc_detail.30350276.shop_block.dshopinfo.52f17dd6b1ptE2)

### 产品功能

- 具备与飞控通信获取无人机运行状态的功能；
- 具备 WiFi 信标帧广播功能；
- 具备蓝牙5 广播功能；
- 具备网页查看无人机状态功能；
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

| 硬件外观                                                                           | 硬件名称                 | 说明                                                                                                     |
| ---------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| <img src="/assets/images/product/datalink/np-rid-sender-gh-board.png" alt="NP-RID-Sender-S3-GH" loading="lazy" />        | NP-RID-Sender-S3-GH      | 主控芯片：ESP32-S3<br />具备所有功能，可直接安装至无人机<br />连接外置天线<br />调试串口为 UART2         |
| <img src="/assets/images/product/datalink/np-rid-sender-c3-pinmini.png" alt="NP-RID-Sender-C3-PinMini" loading="lazy" /> | NP-RID-Sender-C3-PinMini | 主控芯片：ESP32-C3<br />无外置天线、只支持蓝牙不支持 WiFi 广播，一般用于测试使用。<br />调试串口为 UART0 |

## 接口说明

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

## 快速使用（PX4+QGC）

### 连接飞控

这里以 NP-RID-Sender-S3-GH 与雷迅 CUAV V7+飞控为例进行连接说明。

#### 通过串口连接

可以产品附带的飞控串口连接线（4pin 转 6pin），连接设备 UART1 串口至飞控 TELEM1 或 TELEM2 串口。

> 注意，首先需要通过 QGC 地面站设置飞控 TELEM1 或 TELEM2 串口的波特率为 115200。例如设置 TELEM1 的波特率是通过修改参数 SER_TEL1_BAUD 实现。设置完波特率后重启。

接线说明如下：

| 飞控 TELEM2 | RID 设备 UART1 |
| ----------- | -------------- |
| 5V          | 5V             |
| GND         | GND            |
| TX          | RX             |
| RX          | TX             |

连接如下图：

<img src="/assets/images/product/datalink/fcs-connection-1.png" alt="连接示例 1" loading="lazy" />

> 说明：
>
> 这里连接的是 TELEM1，其默认波特率为 115200，如果需要连接其他飞控串口，请设置 RID 模块的串口波特率。例如`param set
>
> 其他类型飞控的连接方式大同小异，只要确保通过飞控提供供电、并且将串口收发交叉连接即可！

#### 通过 CAN 连接

可以产品附带的飞控 CAN 连接线（4pin 转 4pin），连接设备 CAN 至飞控 CAN1 即可。

### QGC 地面站配置

#### 进入设置界面

点击左上角主菜单按钮，然后选择 Application Settings。

<img src="/assets/images/product/datalink/qgc-settings.png" alt="进入设置界面" loading="lazy" />

然后在软件配置界面左侧列表中选择**RemoteID**。

<img src="/assets/images/product/datalink/qgc-remoteid.png" alt="选择 RemoteID" loading="lazy" />

#### 设置产品唯一标识

打开 BasicID 区域下 Broadcast 滑块按钮。填入一个 20 字符的产品唯一标识。

<img src="/assets/images/product/datalink/qgc-unique-id.png" alt="设置唯一标识" loading="lazy" />

#### 设置实名认证

打开 OperatorID 区域下 Broadcast 滑块按钮。填入一个 8 字符的实名认证信息，即操作手身份证后 8位。

<img src="/assets/images/product/datalink/qgc-realname.png" alt="设置实名认证" loading="lazy" />

#### 设置运行类别

由于 QGC 没有添加中国 GB46750 规范标准，故需要根据现有的类型进行映射。这里的映射关系为：

- 选择 SerialNumber，即可设置为开发类；
- 选择 CAA，即可设置为特定类；
- 选择 UTM，即可设置为审定类。

<img src="/assets/images/product/datalink/qgc_basic_id.png" alt="qgc_basic_id" loading="lazy" />

#### 设置无人机分类

现有名称与 GB46750 规范内的名称对应关系如下图：

<img src="/assets/images/product/datalink/qgc_basic_id_2.png" alt="qgc_basic_id_2" loading="lazy" />

#### 设置操控站位置信息

建议选择 Fixed，然后填入地面站经纬度、高度。

<img src="/assets/images/product/datalink/qgc-station-position.png" alt="设置操控站位置" loading="lazy" />

如果选择的不是 Fixed，则 RID 自动使用飞控起飞点的位置。

#### 正常状态

<img src="/assets/images/product/datalink/qgc-normal.png" alt="正常状态" loading="lazy" />

### 连接网页查看状态

无人机上电后，可将无人机置为室外空旷环境，进行搜星定位。

RID 上电后，自动启动 WiFi 热点（热点名称 NP-RID-xxxxxx，密码 nextpilot），通过笔记本连接热点后，打开浏览器，输入<http://192.168.4.1，即可显示设备运行状态。>

<img src="/assets/images/product/datalink/rid-web-status.png" alt="网页查看状态" loading="lazy" />

## 调试串口设置参数

### 调试串口是什么？

可通过**调试串口**灵活设置参数进而控制设备运行逻辑，如设置串口波特率、启动 WiFi 热点、启动打印信息，极大方便用户在使用过程中进行测试。

### 如何连接？

使用调试线（4pin 转 4pin 杜邦线）连接 RID 设备与产品附带的**USB 转 TTL**串口模块，然后将串口模块插入计算机。连接原理如下图所示：

<img src="/assets/images/product/datalink/debug-serial.png" alt="调试串口连接" loading="lazy" />

> 这里以 NP-RID-Sender-S3-GH 板子为例，如果使用其他板子，请在[接口说明](#接口说明)章节找到对应板子的调试串口，与 USB 转 TTL 模块连接，然后再将 USB 转 TTL 模块插入计算机。

### 如何发送命令？

在计算机打开 JCom 串口调试助手（下载链接[JCom | 专业的实时曲线串口助手 - Jooiee](https://www.jooiee.com/cms/ruanjian/115.html)）后，设置串口号（自动识别）、波特率（115200），点击打开。**输入对应命令后再输入一个回车**，然后点击发送按钮即可。

<img src="/assets/images/product/datalink/np-rid-set-params.png" alt="参数设置" loading="lazy" />

### 常用参数命令

相关参数命令如下表所示：

| 操作                 | 命令                       | 示例                                       |
| -------------------- | -------------------------- | ------------------------------------------ |
| 查看所有参数         | param list                 | 查看所有参数：param list                   |
| 重置参数为出厂默认值 | param reset                | 重置为默认参数：param reset                |
| 查看指定参数         | `param get [name]`         | 查看数据输出串口波特率：param get CFG_BAUD |
| 设置参数             | `param set [name] [value]` |                                            |

**命令示例**

- 设置串口 1 波特率：param set BAUDRATE 115200
- 设置无人机唯一标识码：param set GB_UNIQUE_ID prodYYMMDD0123456789
- 设置实名认证：param set GB_REALNAME 08082330
- 设置无人机为小型：param set GB_UA_CLASS 1
- 恢复默认值：param reset

> **注意事项**
>
> 设置唯一产品标识码，必须输入 20个字符，否则无法设置。
>
> 设置实名登记号，必须输入 8个数字字符，否则无法设置。

### 参数汇总

常用参数说明如下表：

| 参数             | 描述                   | 备注                                                                                                                                          |
| ---------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| WIFI_SSID        | WiFi 热点名            |                                                                                                                                               |
| WIFI_PASSWORD    | WiFi 密码              | 隐藏显示，默认 nextpilot                                                                                                                      |
| GB_UNIQUE_ID     | 无人机唯一标识         |                                                                                                                                               |
| BAUDRATE         | 串口 1 波特率          | 默认 115200                                                                                                                                   |
| GB_WIFI_NAN_RATE | WiFi-NAN 广播频率      | 默认 1次/秒                                                                                                                                   |
| GB_WIFI_BCN_RATE | WiFi-Beacon 广播频率   | 默认 1次/秒                                                                                                                                   |
| WIFI_CHANNEL     | WiFi 广播频道          |                                                                                                                                               |
| WIFI_POWER       | WiFi 功率              |                                                                                                                                               |
| GB_BLE_RATE      | 蓝牙5 广播频率         | 默认 1次/秒                                                                                                                                   |
| GB_REALNAME      | 实名认证，身份证后 8位 |                                                                                                                                               |
| GB_OP_CATEGORY   | 运行类别               | 0：未声明；<br />1：开放类；<br />2：特定类；<br />3：审定类。<br />具体参见 GB46750-2025                                                     |
| GB_UA_CLASS      | 无人机分类             | 0：微型（<0.25kg）<br />1：轻型（0.25-4kg）<br />2：小型（4-15kg）<br />3：中型（15-150kg）<br />4：大型（>150kg）<br />具体参见 GB46750-2025 |
| WEBSERVER_EN     | 启动/关闭网页服务器    |                                                                                                                                               |
| SIM_ON           | 启动/关闭 RID 模拟     |                                                                                                                                               |
| OPTIONS          | 无人机基本信息设置选项 | 0：使用参数设置；<br />2：使用地面站配置信息设置（默认）                                                                                      |

## 高级功能

### 设置无人机基本信息

**设置唯一产品标识**

```shell
param set GB_UNIQUE_ID NEXTpil0tA2C4E6G8K0M2

```

这里产品标识必须是经 UOM 申报后的 20位数字+字母的组合。

**设置实名认证 ID**

```shell
param set GB_REALNAME 12340206

```

这里实名认证 ID 必须是 8位数字组成！

**设置无人机分类**

```shell
param set GB_UA_CLASS 1

```

数字对应的无人机分类如下：

- 0：微型<0.25kg（MICRO）
- 1：轻型 0.25-4kg（LIGHT）
- 2：小型 4-15kg（SMALL）
- 3：中型 15-150kg（MEDIUM）
- 4：大型>150kg（LARGE）

**设置运行类别**

```shell
param set GB_OP_CATEGORY 1

```

数字对应的运行类别如下：

- 1：OPEN（开放类）
- 2：SPECIFIC（特定类）
- 3：CERTIFIED（审定类）

设置完成后，请重启 RID 设备。

### 模拟 RID

在没有连接无人机飞控设备的条件下，如果需要进行测试，可使用该产品模拟一个 RID。配置步骤如下：

1. 连接串口调试助手
2. 发送配置命令：param set SIM_ON 1
3. 重启设备即可

若需要关闭 RID 模拟，只需要输入`param set SIM_ON 0`，然后重启设备即可。

## OTA 升级

### 下载

| 板子                     | 当前固件版本 | 点击下载                                                             |
| ------------------------ | ------------ | -------------------------------------------------------------------- |
| NP-RID-Sender-S3-GH      | V1.1         | [OTA 升级 app 固件](/assets/files/NP-RID-Sender-S3-GH-V1.1_OTA.bin)      |
| NP-RID-Sender-C3-PinMini | V1.0         | [OTA 升级 app 固件](/assets/files/NP-RID-Sender-C3-PinMini-V1.0_OTA.bin) |

### 上传固件

连接 RID 设备热点，打开网页[http://192.168.4.1](http://192.168.4.1)，点击选择文件，选择下载的固件后点击 Update 按钮即可。

<img src="/assets/images/product/datalink/rid-ota-upload.png" alt="上传固件" loading="lazy" />

升级后设备自动重启。
