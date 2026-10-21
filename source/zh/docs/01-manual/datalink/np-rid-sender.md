---
layout: doc
order: 2
title: NP-RID-Sender
description: >-
  NP-RID-Sender 广播式无人机运行识别发射器，满足 GB 46750-2025 标准，
  支持 MAVLink/DroneCAN 协议连接飞控，通过 WiFi 或蓝牙广播无人机运行状态，
  适配 Ardupilot、PX4 等主流飞控，满足无人机飞行监管需求。
---

# NP-RID-Sender 运行识别发射器

## 产品简介

NP-RID-Sender 是 NextPilot 推出的一款广播式无人机运行识别发射器，满足 GB 46750-2025 标准要求，可通过 WiFi 及蓝牙广播无人机运行状态信号，满足对无人机飞行监管需求。目前支持 MAVLink、DroneCAN 协议连接，支持的飞控有 Ardupilot、PX4 等，**如需要支持其他飞控或协议，可定制开发**。

购买链接：<https://item.taobao.com/item.htm?id=1074097497449&mi_id=0000KHD5urOB5ulWhlh0CZLkO54UwXlaqMXVS7sOhyvD7lY>

视频教程：[nextpilot rid发射模块-哔哩哔哩_bilibili](https://search.bilibili.com/all?keyword=nextpilot+rid发射模块&from_source=web_search&spm_id_from=333.1007&search_source=5)

## 产品功能

- 具备与飞控通信获取无人机运行状态的功能；
- 具备 WiFi 信标帧广播功能；
- 具备蓝牙5 广播功能；
- 具备网页查看无人机状态功能；
- 具备WiFi数传功能；
- 具备虚拟 RID 模拟功能；
- 具备参数设置功能，可通过串口调试助手连接设备后，通过参数命令快速设置所有参数；
- 具备 OTA 升级功能；

## 规格参数

- 支持主控芯片：ESP32-S3/ESP32-C3；
- 接口：2个串口**（含飞控串口、调试串口）**、1个 USB、1个 CAN；
- 支持输入协议：MAVLink、DroneCAN；
- 支持发射信号类型：WIFI 广播信标帧、蓝牙5；
- 发射功率：20dBm；
- 发射协议：GB46750；

## 硬件形态

目前支持如下硬件：

<img src="/assets/images/product/datalink/np_rid_sender_board.png" alt="np_rid_sender_board" style="zoom: 67%;" />

::: info
这个我们自研的第二个板子，主要更改点是增加了USB Hub，将UART0通过USB引出，这样直接通过USB连接计算机即可完成参数配置。
:::

## 接口说明

硬件外部接口如下图所示：

<img src="/assets/images/product/datalink/np_rid_receiver_interfaces.png" alt="np_rid_receiver_interfaces" style="zoom:80%;" />

详细说明如下表：

| 接口  | 引脚线序                   | 备注                                                                                                   |
| ----- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| USB   | USB，Type-C                | 板子内置USB Hub，连接一路USB至计算机，即可看到两路USB转串口。                                          |
| UART1 | RX: GPIO17<br />TX: GPIO18 | 默认第一个为调试串口，第二个为调试打印串口。**飞控串口**<br />默认波特率 115200<br />接插件标识为 J6   |
| UART2 | RX: GPIO44<br />TX: GPIO43 | **调试串口**<br />用于调试、参数配置，搭配USB转TTL模块使用<br />默认波特率 115200<br />接插件标识为 J4 |
| CAN   | RX: GPIO38<br />TX: GPIO47 | 直接连接飞控 CAN 即可<br />接插件标识为J5                                                              |

## 尺寸大小

<img src="/assets/images/product/datalink/np_rid_NP_S3_CMV2_size.png" alt="np_rid_NP_S3_CMV2_size" style="zoom:50%;" />

## 快速使用（PX4+QGC）

### 首先连接飞控

这里以与雷迅 CUAV V7+飞控为例进行连接说明。

#### 通过串口连接

可以产品附带的飞控串口连接线（4pin 转 6pin），连接设备 UART1 串口至飞控 TELEM1 或 TELEM2 串口。

::: tip
首先需要通过 QGC 地面站设置飞控 TELEM1 或 TELEM2 串口的波特率为 115200。例如设置 TELEM1 的波特率是通过修改参数 SER_TEL1_BAUD 实现。设置完波特率后重启。
:::

::: info
如果需要连接其他飞控串口，请设置 RID 模块的串口波特率。其他类型飞控的连接方式大同小异，只要确保通过飞控提供供电、并且将串口收发交叉连接即可！
:::

#### 通过 CAN 连接

可以产品附带的飞控 CAN 连接线（4pin 转 4pin），连接设备 CAN 至飞控 CAN1 或CAN2即可。

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

#### 最终设置效果

<img src="/assets/images/product/datalink/qgc-normal.png" alt="正常状态" loading="lazy" />

### 连接网页查看状态

无人机上电后，可将无人机置为室外空旷环境，进行搜星定位。

RID 上电后，自动启动 WiFi 热点（热点名称 `NP-RID-xxxxxx`，密码 `nextpilot`），通过笔记本连接热点后，打开浏览器，输入<http://192.168.4.1>，即可显示设备运行状态。

<img src="/assets/images/product/datalink/rid-web-status.png" alt="网页查看状态" loading="lazy" />

### RID接收验证方法

可通过手机APP或一些测试用RID接收设备完成接收验证。

- 接收验证设备：[NP-RID-Receiver](https://nextpilot.org/docs/manual/datalink/np-rid-receiver.html)

- 手机APP：[下载嗖嗖Fly APP](https://app.sousoufly.com/)

## 设置参数

可通过**调试串口**灵活设置参数进而控制设备运行逻辑，如设置串口波特率、启动 WiFi 热点、启动打印信息，极大方便用户在使用过程中进行测试。

### 连接设备

通过USB连接RID设备至计算机后，即可在设备管理器看到两个USB串口设备，第一个USB串口作为固件烧录使用，第二个USB串口即为UART0，默认作为调试打印串口，可通过该串口查看运行打印状态信息。

<img src="/assets/images/product/datalink/usbhub_2coms.png" alt="usbhub_2coms" style="zoom:80%;" />

### 发送命令

在计算机打开 JCom 串口调试助手（下载链接[JCom | 专业的实时曲线串口助手 - Jooiee](https://www.jooiee.com/cms/ruanjian/115.html)）后，设置波特率（115200），选择第二个串口，点击打开。**输入对应命令后再输入一个回车**，然后点击发送按钮即可。

<img src="/assets/images/product/datalink/np-rid-set-params.png" alt="参数设置" loading="lazy" />

### 常用命令

相关参数命令如下表所示：

| 操作                 | 命令                       | 示例                                       |
| -------------------- | -------------------------- | ------------------------------------------ |
| 查看所有参数         | `param list`               | 查看所有参数：param list                   |
| 重置参数为出厂默认值 | `param reset`              | 重置为默认参数：param reset                |
| 查看指定参数         | `param get [name]`         | 查看数据输出串口波特率：param get CFG_BAUD |
| 设置参数             | `param set [name] [value]` |                                            |

**命令示例**

- 设置串口 1 波特率：`param set BAUDRATE 115200`
- 设置无人机唯一标识码：`param set GB_UNIQUE_ID prodYYMMDD0123456789`
- 设置实名认证：`param set GB_REALNAME 08082330`
- 设置无人机为小型：`param set GB_UA_CLASS 1`
- 恢复默认值：`param reset`

::: tip

- 设置唯一产品标识码，必须输入 20个字符，否则无法设置。
- 设置实名登记号，必须输入 8个数字字符，否则无法设置。

:::

### 参数汇总

常用参数说明如下表：

| 参数             | 描述                   | 备注                                                                                                                                          |
| ---------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| WIFI_SSID        | WiFi 热点名            | NP-RID-xxxxxx                                                                                                                                 |
| WIFI_PASSWORD    | WiFi 密码              | 隐藏显示，默认 nextpilot                                                                                                                      |
| GB_UNIQUE_ID     | 无人机唯一标识         | 需UOM认证                                                                                                                                     |
| BAUDRATE         | 串口 1 波特率          | 默认 115200                                                                                                                                   |
| CAN_NODE         | 分配CAN节点ID          | 默认为0<br />对于无DNA（动态节点分配）功能的飞控，必须手动设置该值                                                                            |
| GB_WIFI_NAN_RATE | WiFi-NAN 广播频率      | 默认 1次/秒                                                                                                                                   |
| GB_WIFI_BCN_RATE | WiFi-Beacon 广播频率   | 默认 1次/秒                                                                                                                                   |
| WIFI_CHANNEL     | WiFi 广播频道          | 默认6                                                                                                                                         |
| WIFI_POWER       | WiFi 功率              | 默认-20dBm                                                                                                                                    |
| GB_BLE_RATE      | 蓝牙5 广播频率         | 默认 1次/秒                                                                                                                                   |
| GB_REALNAME      | 实名认证，身份证后 8位 |                                                                                                                                               |
| GB_OP_CATEGORY   | 运行类别               | 0：未声明；<br />1：开放类；<br />2：特定类；<br />3：审定类。<br />具体参见 GB46750-2025                                                     |
| GB_UA_CLASS      | 无人机分类             | 0：微型（<0.25kg）<br />1：轻型（0.25-4kg）<br />2：小型（4-15kg）<br />3：中型（15-150kg）<br />4：大型（>150kg）<br />具体参见 GB46750-2025 |
| WEBSERVER_EN     | 启动/关闭网页服务器    | 默认1，启动                                                                                                                                   |
| SIM_ON           | 启动/关闭 RID 模拟     | 默认0，关闭                                                                                                                                   |
| OPTIONS          | 无人机基本信息设置选项 | 0：使用参数设置；<br />2：使用地面站配置信息设置（默认）                                                                                      |

## 高级功能

### 基本信息设置

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

### RID模拟功能

在没有连接无人机飞控设备的条件下，如果需要进行测试，可使用该产品模拟一个 RID。配置步骤如下：

1. 连接串口调试助手
2. 发送配置命令：`param set SIM_ON 1`
3. 重启设备即可

若需要关闭 RID 模拟，只需要输入`param set SIM_ON 0`，然后重启设备即可。

### 时间同步

在以下情况下需要时间同步：

- 连接无人机后（RID模块默认使用无人机系统时间）但无人机系统时间无效；
- 启用RID模拟功能后，对时间精度有要求；

设置步骤如下：

- 将调试串口连接计算机，打开串口调试助手；

- 设置一个一分钟后的时间，到达时间点后选择发送如下北京时间格式数据：

  ```bash
  param set GB_UTC8_TIME 2026-09-21T10:30:00
  ```

  注意由于日期字符串中间不能有空格，故通过字母`T`连接。

  也可以直接设置unix时间（单位s），命令如下：

  ```bash
  param set GB_UTC_TIME 1789833600
  ```

### WiFi数传功能

RID模块上电后会默认通过局域网段UDP广播形式，将通过串口接收到的飞控数据发送至所有连接其热点的计算机。这样RID模块就相当于一个WiFi数传，将飞控数据完整的透传至地面站。

<img src="/assets/images/product/datalink/rid-sender-WiFi-link-frame.png" alt="WiFi连接" loading="lazy" />

::: tip
仅支持透传飞控串口数据，不支持CAN连接透传数据。
:::

**具体步骤**

1. 将飞控TELEM串口连接至RID数据串口，确认波特率一致；
2. 在笔记本打开QGC地面站；
3. 笔记本连接RID模块热点，QGC会自动建立与飞控的通信连接。

通过RID模块的WiFi数传功能，可以实现约二百米以内的稳定数据通信，成本低、简单方便，非常适合日常调试。

### 查看板子硬件信息

打开网页，即可在网页左上角查看固件版本、板子名称等信息。

<img src="/assets/images/product/datalink/board_infos.png" alt="board_infos" style="zoom:67%;" />

### 第三方飞控适配

#### CAN连接DroneCAN协议适配

请参考[CAN适配说明](../../../blog/remoteID/CAN.md)。

#### 串口连接MAVLink适配

请参考[MAVLink适配说明](../../../blog/remoteID/MAVLink_serial.md)。

## OTA 升级

### 固件下载

| 板子                | 当前固件版本 | 点击下载                                                                 |
| ------------------- | ------------ | ------------------------------------------------------------------------ |
| NP-RID-Sender-S3-GH | V1.2         | [OTA 升级 app 固件](/assets/files/NP-RID-Sender-S3-GH-V1.2_OTA.bin)      |
|                     | V1.3         | [OTA 升级 app 固件](/assets/files/NP-RID-Sender-S3-GH-V1.3_OTA.bin)      |
| NP_S3_CMV2          | V1.3         | [OTA 升级 app 固件](/assets/files/NP-RID-Sender-NP_S3_CMV2-V1.3_OTA.bin) |

### 更新固件

连接 RID 设备热点，打开网页[http://192.168.4.1](http://192.168.4.1)，点击选择文件，选择下载的固件后点击 Update 按钮即可。升级后设备自动重启。

<img src="/assets/images/product/datalink/rid-ota-upload.png" alt="上传固件" loading="lazy" />

## 常见问题

1. 在地面站完成所有配置，仍然报错Arm uninitilized：请确认是否开启了RID模拟，通过`param set SIM_ON 0`关闭模拟；
2. 通过CAN连接PX4时，网页中显示的产品标识码与QGC地面站设置的不同，而通过串口连接时二者一样：可能你使用的PX4版本低于v1.18，在这之前的版本PX4 的 DroneCAN `send_basic_id()` 把 `uas_id` 取自 **MCU 序列号/board UUID**，而非QGC地面站的设置；
3. 通过CAN连接其他飞控后，无法正常显示，首先确认飞控是否具备CAN节点自动分配功能，如果不具备该功能则需要通过命令手动分配一个节点，例如`param set CAN_NODE 3`;

## 更新记录

### v1.0

初始版本，完成RID基础功能。

### v1.2

修复协议赋值错误，优化WiFi广播，增加时间同步功能。

### v1.3

增加对NP_S3_CMV2板子的支持，暴露CAN_NODE参数可由用户设置。
