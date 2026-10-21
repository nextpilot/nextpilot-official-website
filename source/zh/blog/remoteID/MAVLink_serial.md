---
title: 第三方飞控与RemoteID发射模块适配说明
shortTitle: 飞控MAVLink适配说明
description: RemoteID模块通过串口（MAVLink协议）与飞控连接，这里详细描述二者连接原理，为飞控开发人员开发RemoteID功能提供指导
summary: RemoteID模块通过串口（MAVLink协议）与飞控连接，这里详细描述二者连接原理，为飞控开发人员开发RemoteID功能提供指导
date: 2026-10-18
category: MAVLink
tags: [无人机运行识别广播, MAVLink, 飞控适配, PX4, RemoteID]
cover: /assets/images/blog/MAVLink_logo.png
---

# RemoteID模块MAVLink串口适配说明

本指南面向**第三方飞控固件开发者**，说明飞控如何通过 UART 串口与 RemoteID 模块通信，完成：

- 飞控 → RID 模块：上报无人机身份、实时位置、操控站位置、系统信息；
- RID 模块 → 飞控：回传预解锁状态（ArmStatus），供飞控起飞前检查；
- RID 模块：将收到的数据按 GB 46750 / ASTM F3411 通过 WiFi Beacon、WiFi NAN、BLE 广播。

> 若飞控使用 CAN 连接，请参阅 [RemoteID模块CAN适配说明](CAN.md)。两者数据语义基本一致，但**串口链路的超时与时间戳判定存在差异**，不能直接照搬。

---

## 目录

1. [系统概述](#1-系统概述)
2. [硬件连接](#2-硬件连接)
3. [链路与协议特性](#3-链路与协议特性)
4. [报文总览](#4-报文总览)
5. [飞控 → RID 模块的报文](#5-飞控--rid-模块的报文)
6. [RID 模块 → 飞控的报文](#6-rid-模块--飞控的报文)
7. [时序、频率与时间戳](#7-时序频率与时间戳)
8. [预解锁判据](#8-预解锁判据)
9. [参数接口](#9-参数接口)
10. [参考实现](#10-参考实现)
11. [联调与排障](#11-联调与排障)
12. [附录](#12-附录)

---

## 1. 系统概述

```
┌──────────────────┐   UART1  115200 8N1    ┌─────────────────────┐
│                  │◄──── MAVLink 2 ────────►│                     │
│   第三方飞控      │  12900 / 12901 / 12903  │   RemoteID 模块      │──► WiFi Beacon / NAN
│                  │  12904 / 12905 / 12919  │   (ESP32)           │──► BLE 4 / BLE 5
│                  │◄─── 12918 ArmStatus ────┤                     │
│                  │◄─── 0 Heartbeat ────────┤                     │
└──────────────────┘                         └─────────────────────┘
```

- 飞控是**数据源**，周期发送 OpenDroneID 报文；
- 模块是**发射器 + 预解锁检查器**，负责组包、广播，并把检查结果回传飞控；
- 模块在 MAVLink 链路上表现为一个**外设节点**：
  - `sysid`：默认**沿用飞控的 sysid**（从飞控心跳学习，见 3.3 节）；
  - `compid`：固定 `MAV_COMP_ID_ODID_TXRX_1 = 236`；
  - `type`：`MAV_TYPE_ODID = 34`。

**关键设计约束**：模块不是 MAVLink 路由器，也不实现完整的 MAVLink 外设协议栈。它只解析本文第 5 节列出的报文，并只主动发送第 6 节列出的报文。

> 同一模块可以同时启用 UART（MAVLink）和 CAN（DroneCAN）两种 transport。两路共用同一份数据缓存，同一类报文以**最后到达者**为准。本文只描述 UART 通道；CAN 通道见 [DroneCAN 飞控集成指南](CAN.md)。

### 1.1 快速接入清单

如果只想尽快跑通，先保证这 6 件事：

1. 飞控 UART 配成 **115200、8N1、MAVLink 2**；
2. **TX/RX 交叉**，共地，3.3 V TTL；
3. 飞控上电后**立即、持续**发送 `HEARTBEAT`，且 `type != MAV_TYPE_GCS`；
4. 周期发送 `OPEN_DRONE_ID_BASIC_ID`、`LOCATION`、`SYSTEM`、`SELF_ID`、`OPERATOR_ID` 五类报文；
5. `LOCATION.timestamp`、`SYSTEM.timestamp` **必须非 0**，`SYSTEM.timestamp` 还必须持续变化；
6. 经纬度、操控站经纬度不能是 `0,0`。

满足以上条件后，模块会在 1 Hz 的 `OPEN_DRONE_ID_ARM_STATUS` 中返回 `GOOD_TO_ARM`。

---

## 2. 硬件连接

### 2.1 接线

| 飞控侧  | 模块侧                    | 说明                         |
| ------- | ------------------------- | ---------------------------- |
| UART TX | `PIN_UART_RX`（UART1 RX） | 飞控发，模块收               |
| UART RX | `PIN_UART_TX`（UART1 TX） | 模块发，飞控收               |
| GND     | GND                       | **必须共地**，否则通信不稳定 |
| —       | 模块电源输入              | 模块独立供电，UART 不供电    |

注意：

- 模块 UART 是 **3.3 V TTL 电平**，不是 RS-232，也不是 5 V TTL。飞控串口若为 5 V 电平，必须做电平转换。
- 模块的 UART1 是**全双工**，只需 TX、RX、GND 三根线。
- 固件未启用硬件流控（`PIN_UART_CTS/RTS` 即使定义也未使用），飞控侧请关闭 RTS/CTS。
- 模块的 UART1 TX 在启动时会输出 ASCII 启动横幅（见 3.2 节），这是正常现象，不是故障。

### 2.2 串口参数

| 项目     | 值                                      |
| -------- | --------------------------------------- |
| 波特率   | 默认 **115200**，由参数 `BAUDRATE` 配置 |
| 数据格式 | **8N1**（8 数据位、无校验、1 停止位）   |
| 流控     | 无                                      |
| 电平     | 3.3 V TTL                               |
| 协议     | MAVLink 2（推荐；帧格式见 3.1 节）      |

`BAUDRATE` 的取值范围是 9600–921600（UINT32）。注意：

- 该参数**同时作用于飞控串口和调试串口**（`Serial1.begin(g.baudrate, ...)` 与 `DEBUG_SERIAL.begin(g.baudrate)`）；
- 修改后需要**重启模块**才生效；
- 改动后如果飞控侧不同步修改，现象是模块串口完全无数据、模块控制台持续打印 `Waiting for heartbeat`。

### 2.3 各板卡 UART1 引脚

`PIN_UART_TX` / `PIN_UART_RX` 定义：

| 板卡（编译宏） | 模块 TX | 模块 RX | 备注 |
| -------------- | ------- | ------- | ---- |
| `ESP32S3_NP`   | 18      | 17      |      |
| `ESP32S3_NPV2` | 3       | 2       |      |

> 引脚编号是 **ESP32 芯片侧 GPIO**，不是排针丝印编号。接线前请以具体板卡的原理图/丝印为准。

### 2.4 调试串口与飞控串口不是同一个口

| 串口                            | 用途                    | 默认波特率 |
| ------------------------------- | ----------------------- | ---------- |
| UART1（`Serial1`）              | **与飞控通信，MAVLink** | 115200     |
| UART0 / UART2（`DEBUG_SERIAL`） | 调试日志、参数控制台    | 115200     |

不同板卡的调试口不同：`ESP32S3_NP` 使用 UART2（GPIO11/12），其余板卡默认 UART0（USB）。调试口只用于开发调试，**不要**把飞控接到调试口上。

---

## 3. 链路与协议特性

### 3.1 MAVLink 版本

| 项目       | 行为                                                   |
| ---------- | ------------------------------------------------------ |
| 模块发送   | **MAVLink 2** 帧（起始符 `0xFD`）                      |
| 模块接收   | 同时支持 MAVLink 1（`0xFE`）和 MAVLink 2（`0xFD`）解析 |
| 使用的方言 | `common`（`generated/all/mavlink.h`）                  |
| 签名       | 不要求                                                 |

**飞控必须使用 MAVLink 2 发送 OpenDroneID 报文。** 原因：OpenDroneID 报文的 ID 是 12900 以上，MAVLink 1 的帧头只有 8 位 `msgid`，无法承载。MAVLink 1 仅能用于 `HEARTBEAT`、`PARAM_*` 等 ID ≤ 255 的报文。

建议直接使用官方 MAVLink 库生成的头文件，不要手工拼帧。报文 CRC extra 见附录 A。

### 3.2 收发模型与解析行为

模块在 `loop()` 中不断读取 UART1 的每一个字节：

```cpp
// mavlink.cpp:109-125
const uint16_t nbytes = serial.available();
for (uint16_t i = 0; i < nbytes; i++) {
    const uint8_t c = (uint8_t)serial.read();
    if (mavlink_parse_char(chan, c, &msg, &status)) {
        process_packet(status, msg);
    }
}
```

由此得到几个对飞控侧有影响的结论：

1. **模块不按 `target_system` / `target_component` 过滤报文**。飞控发送时把这两个字段填 `0`（广播）即可。
2. **模块只按 `msgid` 处理报文**，不校验来源 `sysid`。同一链路上其他 MAVLink 设备发来的 OpenDroneID 报文也会被接受（见 3.4 节 UDP 转发）。
3. **模块会在同一 UART 上主动发送报文**（心跳、ArmStatus、PARAM_VALUE、STATUSTEXT）。飞控的 MAVLink 解析器必须能同时处理双向流量。
4. **启动阶段 UART1 上会出现非 MAVLink 的 ASCII 文本**：
   - 模块启动时打印 `ArduRemoteID version x.y xxxxxxxx`（`mavlink.cpp:44-45`）；
   - 尚未学习到 sysid 时，每 2 秒打印一次 `Waiting for heartbeat`（`mavlink.cpp:57-59`）。

   标准 MAVLink 解析器会自动重新同步（寻找 `0xFD`/`0xFE`），一般无需特殊处理。但如果飞控侧使用严格的自定义协议解析器，必须容忍这些字节，不能因为收到 ASCII 就判定链路故障。

5. **模块不实现** `PING`、`MAV_CMD_REQUEST_MESSAGE`、`TIMESYNC`、`AUTOPILOT_VERSION` 等请求响应。不要等待这些回应。

### 3.3 sysid 与 compid

模块的 MAVLink 身份定义：

```cpp
// mavlink.cpp:17
mavlink_system_t mavlink_system = {0, MAV_COMP_ID_ODID_TXRX_1};
```

- `compid` 固定为 **236**（`MAV_COMP_ID_ODID_TXRX_1`）；
- `sysid` 的确定顺序（`mavlink.cpp:53-60, 155-165`）：

| 条件                         | 模块的 sysid                                                           |
| ---------------------------- | ---------------------------------------------------------------------- |
| 参数 `MAVLINK_SYSID != 0`    | 直接使用 `MAVLINK_SYSID`                                               |
| `MAVLINK_SYSID == 0`（默认） | 从**第一条** `sysid > 0` 且 `type != MAV_TYPE_GCS` 的 `HEARTBEAT` 学习 |
| 两者都没有                   | 保持 0，**不发送**心跳和 ArmStatus                                     |

**飞控侧要点**：

1. 飞控上电后应**立即、无条件**发送 `HEARTBEAT`，不要等待模块先发心跳——否则双方互相等待，链路永远起不来。
2. `HEARTBEAT.type` 不能是 `MAV_TYPE_GCS`，否则模块不会学习。
3. 默认 `MAVLINK_SYSID = 0` 是推荐配置：RID 模块作为飞控外设，使用飞控的 sysid，地面站会把它们识别为同一架飞机。若设为非 0 值，需自行保证该 sysid 与飞控一致，否则地面站可能不把模块认作本机外设。
4. 模块只在 `sysid == 0` 时学习，之后不再改变。若飞控中途修改 sysid，模块不会跟随，需要重启模块。

### 3.4 UDP 转发（可选，默认开启）

当 `UDP_FWD_EN = 1`（默认）且模块 WiFi AP 已启动时，模块会做**原始字节双向转发**（`transfer_udp.cpp`）：

- 飞控 → 模块方向的**所有串口字节**，原样转发到 `192.168.4.255:14550`；
- 地面站 → 模块 UDP `:1234` 的字节，原样写入 UART1，发给飞控。

对飞控集成的影响：

| 影响                     | 说明                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| 飞控串口会收到地面站流量 | 地面站连接模块 WiFi 后，其 MAVLink 报文会被注入飞控串口。飞控的 MAVLink 端口需能接受多客户端流量。 |
| 模块会看到地面站流量吗？ | 不会。UDP→UART 的字节只从 UART TX 发出去，不会回环到模块的接收解析。                               |
| 地面站能看到模块吗？     | 能。模块的心跳和 ArmStatus 也会经 UDP 广播给地面站；`sysid` 与飞控相同、`compid = 236`。           |
| 不想转发怎么办？         | 将 `UDP_FWD_EN` 设为 0（Web 或调试控制台）。                                                       |

> 如果第三方飞控的 MAVLink 端口对“非本机组件”的消息处理很严格，建议先关闭 `UDP_FWD_EN` 做纯 RID 联调，确认 RID 链路正常后再打开地面站转发。

---

## 4. 报文总览

### 4.1 飞控 → RID 模块

| 报文                           | msgid | 作用                         | 建议频率    | 模块侧超时       |
| ------------------------------ | ----- | ---------------------------- | ----------- | ---------------- |
| `HEARTBEAT`                    | 0     | 让模块学习 sysid             | 1 Hz        | 无（只学习一次） |
| `OPEN_DRONE_ID_BASIC_ID`       | 12900 | 无人机身份                   | 1 Hz        | 无               |
| `OPEN_DRONE_ID_LOCATION`       | 12901 | 无人机实时位置               | **5–10 Hz** | **3 s**          |
| `OPEN_DRONE_ID_SYSTEM`         | 12904 | 操控站位置、系统信息、时间戳 | 1 Hz        | **3 s**          |
| `OPEN_DRONE_ID_SYSTEM_UPDATE`  | 12919 | 仅更新操控站位置（可选）     | 1 Hz        | 见 5.5           |
| `OPEN_DRONE_ID_SELF_ID`        | 12903 | 飞行描述                     | 1 Hz        | 22 s             |
| `OPEN_DRONE_ID_OPERATOR_ID`    | 12905 | 操控者/实名登记号            | 1 Hz        | 22 s             |
| `OPEN_DRONE_ID_AUTHENTICATION` | 12902 | 身份认证（可选）             | —           | 无               |

**最小可用集**：`HEARTBEAT` + 12900 + 12901 + 12904 + 12903 + 12905。只有这六类报文都持续发送，模块才可能给出 `GOOD_TO_ARM`。

> 这些报文应只在**连接 RID 模块的那一个 MAVLink 通道**上发送。如果把 OpenDroneID 报文同时发到所有 MAVLink 通道，地面站、数传等链路也会收到，既浪费带宽也容易造成重复数据。
>
> `OPEN_DRONE_ID_AUTHENTICATION` 会被解码但不参与组包，也不影响预解锁。不需要发送。
>
> `OPEN_DRONE_ID_MESSAGE_PACK`（12920）**不被支持**，请逐条发送上述报文。

### 4.2 RID 模块 → 飞控

| 报文                       | msgid | 作用               | 频率                    |
| -------------------------- | ----- | ------------------ | ----------------------- |
| `HEARTBEAT`                | 0     | 模块在线指示       | 1 Hz（学习到 sysid 后） |
| `OPEN_DRONE_ID_ARM_STATUS` | 12918 | 预解锁检查结果     | 1 Hz                    |
| `PARAM_VALUE`              | 22    | 参数读取/设置响应  | 按请求                  |
| `STATUSTEXT`               | 253   | 参数锁定等错误提示 | 事件触发                |

---

## 5. 飞控 → RID 模块的报文

以下所有报文都使用 MAVLink 2 帧；`target_system` / `target_component` 建议填 `0`（模块不检查）；`id_or_mac[20]` 在飞控直发时填全 0（该字段专用于转发其他无人机的 RID 数据）。

### 5.1 HEARTBEAT（msgid 0）

| 字段                                                     | 要求                           |
| -------------------------------------------------------- | ------------------------------ |
| `sysid`                                                  | > 0                            |
| `type`                                                   | **不能是** `MAV_TYPE_GCS`（6） |
| `autopilot`、`base_mode`、`custom_mode`、`system_status` | 模块不关心，正常填写即可       |
| 发送时机                                                 | 上电即发，持续 1 Hz            |

模块只把它用于学习 sysid（`mavlink.cpp:155-165`），不会据此判断飞控状态，也不会回复 ACK。

```c
mavlink_msg_heartbeat_send(chan,
                           MAV_TYPE_QUADROTOR,
                           MAV_AUTOPILOT_GENERIC,
                           0, 0, 0);
```

### 5.2 OPEN_DRONE_ID_BASIC_ID（msgid 12900）

标识无人机身份，是最关键的报文之一。

| 字段               | 类型      | 要求                                       |
| ------------------ | --------- | ------------------------------------------ |
| `target_system`    | uint8     | 0                                          |
| `target_component` | uint8     | 0                                          |
| `id_or_mac[20]`    | uint8[20] | 全 0                                       |
| `id_type`          | uint8     | **1–4**（0 会被模块丢弃）                  |
| `ua_type`          | uint8     | 0–15，见附录 B                             |
| `uas_id[20]`       | uint8[20] | ASCII，**不能为空**；不足 20 字节补 `0x00` |

`id_type` 取值：

| 值  | 含义                          |
| --- | ----------------------------- |
| 1   | 制造商序列号（ANSI/CTA-2063） |
| 2   | CAA 登记号                    |
| 3   | UTM 分配的 UUID               |
| 4   | 特定会话 ID                   |

**模块处理逻辑**（`mavlink.cpp:179-190`、`RemoteIDModule.ino:243-310`）：

- 只有 `uas_id` 非空且 `1 <= id_type <= 4` 时才认为有效；
- **默认参数 `OPTIONS = 2`**（bit1 `DONT_SAVE_BASIC_ID_TO_PARAMETERS` 置位）时：
  - BasicID 的 `uas_id` **完全取自飞控实时报文**；
  - **如果飞控不发送该报文，或 `uas_id` 为空，模块不会广播 BasicID**；
  - `id_type = 0` 的报文会被直接丢弃（模块要求 `1 <= id_type <= 4`），因此广播中的 `id_type` 一定来自飞控；
  - `ua_type = 0` 时回退到参数 `GB_UA_CLASS + 1`；
  - **参数 `UAS_ID` 不参与广播内容的回退**（只用于“ID”预解锁检查）。
- 若清除 `OPTIONS` bit1（`OPTIONS` 设为 0 或其他不置 bit1 的值）：
  - BasicID[0] 的 `uas_id` 取自参数 `UAS_ID`；
  - BasicID[0] 的 `ua_type` / `id_type` **实际取自 `GB_UA_CLASS + 1` / `GB_OP_CATEGORY`**（`RemoteIDModule.ino:260-261`）。`UAS_TYPE` / `UAS_ID_TYPE` 只用于判断“参数中是否存在有效 BasicID”（`have_basic_id_info()`），并不直接写入广播内容；
  - 飞控实时发送的 BasicID 若与参数不同，会作为 **BasicID[1]** 一起广播（BasicID[1] 使用 `UAS_TYPE_2` / `UAS_ID_TYPE_2` / `UAS_ID_2`，或飞控实时数据）；
  - 如果参数中尚无有效 BasicID（`UAS_ID` 为空或类型为 0），首次收到的有效 BasicID 会被写入 NVS 参数（自动学习）。参数中已有 ID 时不会再学习。注意：自动学习会写入 `UAS_TYPE` / `UAS_ID_TYPE`，但广播时 BasicID[0] 的类型仍按 `GB_UA_CLASS` / `GB_OP_CATEGORY` 取值，学习到的类型只用于让 `have_basic_id_info()` 成立。

> 因此，**在默认配置下，飞控必须把 BasicID 当作必发报文**，不能依赖模块参数里的默认 ID。

#### 5.2.1 `id_type` / `ua_type` 与 GB 46750 分类的映射

除了 ASTM 身份信息，模块还会用 BasicID 的 `id_type` / `ua_type` 推导 GB 46750 的运行类别和无人机分类（`gb46750.cpp:18-46`）。这个映射是**固件写死的，且与 ASTM 原义不完全对应**：

| 飞控字段  | 取值                         | GB 46750 结果                        |
| --------- | ---------------------------- | ------------------------------------ |
| `id_type` | 1 `SERIAL_NUMBER`            | 开放类                               |
| `id_type` | 2 `CAA_REGISTRATION_ID`      | 特定类                               |
| `id_type` | 3 `UTM_ASSIGNED_UUID`        | 审定类                               |
| `id_type` | 4 `SPECIFIC_SESSION_ID`      | 未声明                               |
| `ua_type` | 1 `AEROPLANE`                | 微型                                 |
| `ua_type` | 2 `HELICOPTER_OR_MULTIROTOR` | **轻型**                             |
| `ua_type` | 3 `GYROPLANE`                | 小型                                 |
| `ua_type` | 4 `HYBRID_LIFT`              | 中型                                 |
| `ua_type` | 5 `ORNITHOPTER`              | 大型                                 |
| `ua_type` | 6–15                         | 未声明                               |
| `ua_type` | 0                            | 使用 `GB_UA_CLASS + 1`，再按上表映射 |

> 该映射是固件实现，不代表 GB 46750 的法规分类定义；量产前请按适用法规确认分类取值。

对飞控开发的直接影响：

- **不能按 ASTM 语义随便填**。例如微型多旋翼如果填 `ua_type = 2`，GB 广播会变成“轻型”；
- 默认 `OPTIONS` 下，`GB_OP_CATEGORY` 基本不会生效——`id_type` 必须为 1–4 报文才会被接受，所以 GB 运行类别始终由 `id_type` 的映射决定；
- 如果希望使用模块侧的 `GB_UA_CLASS`，可以发送 `ua_type = 0`（接收校验只看 `id_type`），模块会改用 `GB_UA_CLASS + 1`；
- 如果 GB 分类要求严格，最可控的做法是：清除 `OPTIONS` bit1，在模块侧配置 `UAS_ID`、`UAS_TYPE` / `UAS_ID_TYPE`（用于判定参数 ID 是否有效）以及 `GB_UA_CLASS` / `GB_OP_CATEGORY`（实际决定 BasicID 类型和 GB 分类），飞控只负责位置和状态。

### 5.3 OPEN_DRONE_ID_LOCATION（msgid 12901）

无人机实时位置。这是频率最高、最容易出现单位错误的报文。

| 字段                  | 单位          | 取值 / 说明                                      |
| --------------------- | ------------- | ------------------------------------------------ |
| `latitude`            | degE7         | −90e7 – +90e7；未知填 0                          |
| `longitude`           | degE7         | −180e7 – +180e7；未知填 0                        |
| `altitude_barometric` | m             | −1000 – 31767.5；未知填 −1000                    |
| `altitude_geodetic`   | m             | −1000 – 31767.5；未知填 −1000                    |
| `height`              | m             | 相对起飞点或地面；未知填 −1000                   |
| `direction`           | cdeg（0.01°） | 0–35999；未知填 **36100**                        |
| `speed_horizontal`    | cm/s          | 0–25425；未知填 **25500**                        |
| `speed_vertical`      | cm/s          | −6200 – +6200，上升为正；未知填 **6300**         |
| `status`              | 枚举          | 0 未声明、1 地面、2 空中、3 紧急、4 RID 系统故障 |
| `height_reference`    | 枚举          | 0 相对起飞点、1 相对地面                         |
| `horizontal_accuracy` | 枚举          | 见附录 B（NACp）                                 |
| `vertical_accuracy`   | 枚举          | 见附录 B（GVA）                                  |
| `barometer_accuracy`  | 枚举          | 见附录 B（GVA）                                  |
| `speed_accuracy`      | 枚举          | 见附录 B（NACv）                                 |
| `timestamp`           | s             | **整点后秒数**，0–3600，可带小数；未知填 0xFFFF  |
| `timestamp_accuracy`  | 枚举          | 0 未知、1 = ≤0.1 s、…、15 = ≤1.5 s（见附录 B）   |

**模块处理逻辑**（`mavlink.cpp:166-178`、`RemoteIDModule.ino:353-372`）：

- 收到任何 `LOCATION` 报文都会刷新 `last_location_ms`，**不要求 `timestamp` 变化**；
- 但只有 `timestamp != 0` 时，模块才会把位置数据装配进 `UAS_data` 并广播；
- `latitude == 0 && longitude == 0` 会被预解锁判为 `LOC`；
- 字段越界会导致 `check_parse()` 失败，ArmStatus 报 `bad LOC data`（`transport.cpp` / `opendroneid.c` 的范围检查）。

**时间戳约定**：`timestamp` 是 **UTC 整点之后的秒数**，不是 Unix 时间戳，也不是开机秒数。典型算法：

```c
float ts = (float)(utc_seconds % 3600) + (utc_milliseconds % 1000) / 1000.0f;
```

如果没有 GPS 时间，至少应发送一个非 0、且能反映“整点后秒数”的值。

**`direction` 是运动方向，不是机头朝向。** 应使用地速矢量的航向，而不是姿态航向。

### 5.4 OPEN_DRONE_ID_SYSTEM（msgid 12904）

操控站（遥控器/地面站）位置和系统级信息。

| 字段                     | 单位  | 取值 / 说明                                       |
| ------------------------ | ----- | ------------------------------------------------- |
| `operator_latitude`      | degE7 | −90e7 – +90e7；未知填 0                           |
| `operator_longitude`     | degE7 | −180e7 – +180e7；未知填 0                         |
| `operator_altitude_geo`  | m     | −1000 – 31767.5                                   |
| `operator_location_type` | 枚举  | 0 起飞点、1 实时 GNSS、2 固定位置                 |
| `classification_type`    | 枚举  | 0 未声明、1 EU                                    |
| `category_eu`            | 枚举  | 0–3（未声明/开放/特定/认证）                      |
| `class_eu`               | 枚举  | 0–7                                               |
| `area_count`             | —     | 区域内飞机数量，默认 1                            |
| `area_radius`            | m     | 0–2550                                            |
| `area_ceiling`           | m     | −1000 – 31767.5                                   |
| `area_floor`             | m     | −1000 – 31767.5                                   |
| `timestamp`              | s     | **自 2019-01-01 00:00:00 UTC 起的秒数**，必须非 0 |

**`timestamp` 是最容易出错的地方**，详见 7.3 节。它不是 Unix 时间戳：

```c
system_timestamp = (uint32_t)(unix_seconds - 1546300800ULL);   // 1546300800 = 2019-01-01
```

**模块处理逻辑**（`mavlink.cpp:207-262`、`RemoteIDModule.ino:336-351`）：

- `timestamp != 0` 是**总开关**：为 0 时模块不会使用任何 `SYSTEM` 字段（包括操控站位置），`SystemValid` 保持 0；
- `last_system_ms` 只在 `timestamp` 变化时刷新（`timestamp == 0` 时除外）。因此**发送常量时间戳会在 3 秒后触发 `SYS` 错误**；
- `operator_latitude == 0 && operator_longitude == 0` 会被预解锁判为 `OP_LOC`；
- 字段越界会导致 `bad SYS data`。

**操控站位置的优先级**（`mavlink.cpp:218-260`）：地面站（QGC）通过 `SYSTEM` / `SYSTEM_UPDATE` 下发的 `FIXED`（固定）位置，会在 3 秒内优先于飞控发送的实时位置；3 秒后恢复使用飞控数据。飞控侧只需按自己的真实数据发送即可，不要尝试与地面站“抢”这个字段。

**推荐填法**：

- 操控站与起飞点相同：`operator_location_type = 0`，经纬度填起飞点；
- 操控站有独立 GNSS：`operator_location_type = 1`，经纬度填操控站实时位置；
- `classification_type = 0`（非欧盟场景）；`category_eu` / `class_eu` 与 GB 广播无直接关系。
- GB 46750 只有“起飞点 / 实时 / 未声明”三种遥控站位置类型，`FIXED`（2）在 GB 广播中会被映射为**实时位置**（`gb46750.cpp:73-85`）。

### 5.5 OPEN_DRONE_ID_SYSTEM_UPDATE（msgid 12919）

仅用于更新操控站位置，可选。字段为 `operator_latitude`、`operator_longitude`、`operator_altitude_geo`、`timestamp`。

| 项目     | 说明                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| 适用场景 | 操控站位置变化快，想比 `SYSTEM` 更高频更新时                                               |
| 模块处理 | 只更新操控站经纬度/高度；`System` 的其他字段仍来自上一条 `SYSTEM`（`mavlink.cpp:263-284`） |
| 前置条件 | **必须先发送过完整的 `SYSTEM`**，否则 `last_system_ms == 0`，本条报文不会刷新新鲜度        |
| 时间戳   | `timestamp` 同上，为 2019 纪元秒                                                           |

如果飞控本来就以 1 Hz 发送 `SYSTEM`，可以不使用本条报文。**不要只发 `SYSTEM_UPDATE` 而不发 `SYSTEM`**。

### 5.6 OPEN_DRONE_ID_SELF_ID（msgid 12903）

| 字段               | 要求                               |
| ------------------ | ---------------------------------- |
| `description_type` | 0 = 纯文本（推荐）                 |
| `description[23]`  | ASCII，最多 23 字节，不足补 `0x00` |

**模块处理逻辑**（`mavlink.cpp:199-206`、`RemoteIDModule.ino:329-334`）：

- 收到报文即刷新 `last_self_id_ms`，**即使 `description` 为空也算收到**；
- 只有 `description` 非空时，才会置 `SelfIDValid` 并参与广播；
- 预解锁只检查“22 秒内是否收到过”，不检查内容。

因此，**即使没有内容也要周期发送**（可以发一个空格或固定文本），否则 ArmStatus 会报 `SELF_ID`。

### 5.7 OPEN_DRONE_ID_OPERATOR_ID（msgid 12905）

| 字段               | 要求                               |
| ------------------ | ---------------------------------- |
| `operator_id_type` | 0 = CAA 登记号                     |
| `operator_id[20]`  | ASCII，最多 20 字节，不足补 `0x00` |

**模块处理逻辑**（`mavlink.cpp:285-291`、`RemoteIDModule.ino:312-327`）：

- 收到报文即刷新 `last_operator_id_ms`，**即使内容为空也算收到**；
- 默认 `OPTIONS = 2`（bit1 置位）时：
  - 飞控 `operator_id` 长度 **≥ 8** 时，使用飞控数据的**前 8 字节**广播；
  - 否则回退到参数 `GB_REALNAME`（默认 `"12345678"`）；
- 清除 bit1 时，一律使用参数 `GB_REALNAME`（8 字节）。

预解锁只检查“22 秒内是否收到过”。因此即使使用参数里的实名登记号，**飞控也必须周期发送本条报文**，否则 ArmStatus 会报 `OP_ID`。

> GB 46750 场景下，`GB_REALNAME` 要求是身份证后 8 位。飞控若要下发实名信息，请发送至少 8 字节的 `operator_id`。

### 5.8 OPEN_DRONE_ID_AUTHENTICATION（msgid 12902）

模块会解码但**不使用**，也不影响广播和预解锁。可以完全不发送。

---

## 6. RID 模块 → 飞控的报文

### 6.1 HEARTBEAT（msgid 0）

| 字段        | 值                                   |
| ----------- | ------------------------------------ |
| `sysid`     | 飞控 sysid（默认）或 `MAVLINK_SYSID` |
| `compid`    | 236（`MAV_COMP_ID_ODID_TXRX_1`）     |
| `type`      | 34（`MAV_TYPE_ODID`）                |
| `autopilot` | 0（`MAV_AUTOPILOT_INVALID`）         |
| 频率        | 1 Hz                                 |
| 起始条件    | 模块成功确定 sysid 之后              |

用途：

- 判断模块是否在线；
- 若飞控支持“外设发现”，可用 `(sysid, compid=236)` 识别 RID 模块。

> 模块发送的心跳 `base_mode` 固定为 0，**不表示飞控解锁状态**，不要用它判断是否已解锁。

### 6.2 OPEN_DRONE_ID_ARM_STATUS（msgid 12918）——最重要的反馈

| 字段        | 类型     | 说明                                          |
| ----------- | -------- | --------------------------------------------- |
| `status`    | uint8    | 0 = `GOOD_TO_ARM`；1 = `PRE_ARM_FAIL_GENERIC` |
| `error[50]` | char[50] | 失败原因，`GOOD` 时为空；最多 49 个可见字符   |

频率：1 Hz。`status` 由模块每轮 `set_data()` 计算后缓存，随心跳一起发送（`mavlink.cpp:81-97`、`arm_status_send()`）。

飞控侧应：

1. 把 `status != 0` 作为**禁止解锁**的条件；
2. 把 `error` 原样显示到地面站/日志，便于定位缺失的数据类型；
3. 处理模块掉线：如果连续若干秒没有收到 ArmStatus，应按“RID 模块不可用”处理（是否禁止解锁由整机安全策略决定）。

`error` 中可能出现的标记：

| 标记               | 含义                                             | 对应检查   |
| ------------------ | ------------------------------------------------ | ---------- |
| `LOC`              | 位置缺失、超过 3 秒未更新，或经纬度为 `0,0`      | 5.3        |
| `SYS`              | System 缺失、超过 3 秒未更新                     | 5.4        |
| `SELF_ID`          | SelfID 超过 22 秒未收到                          | 5.6        |
| `OP_ID`            | OperatorID 超过 22 秒未收到                      | 5.7        |
| `OP_LOC`           | 操控站经纬度为 `0,0`                             | 5.4        |
| `ID`               | 模块参数中没有任何 BasicID（默认参数通常已满足） | 5.2 / 参数 |
| `bad LOC data`     | Location 字段越界，OpenDroneID 编码失败          | 5.3        |
| `bad SYS data`     | System 字段越界                                  | 5.4        |
| `bad ID_1 data`    | BasicID[0] 编码失败                              | 5.2        |
| `bad ID_2 data`    | BasicID[1] 编码失败                              | 5.2        |
| `bad SELF_ID data` | SelfID 编码失败                                  | 5.6        |
| `bad OP_ID data`   | OperatorID 编码失败                              | 5.7        |

> 多个原因会拼接在一起，例如 `LOC SYS OP_LOC`。`LOC` 可能重复出现（缺失和 `0,0` 是两条独立检查）。
>
> `error` 只有 50 字节，原因很多时可能被截断。

**`OPTIONS` bit0（`FORCE_ARM_OK`）置位时**，模块会跳过“数据缺失”类检查直接返回 `GOOD_TO_ARM`；但字段越界导致的 `bad ... data` 仍会返回失败。该位主要用于产线测试，**正式产品不建议开启**。

### 6.3 PARAM_VALUE（msgid 22）

仅在飞控/地面站发起参数请求或参数设置后回复。详见第 9 节。

### 6.4 STATUSTEXT（msgid 253）

模块在以下场景主动发送：

- 参数被 `LOCK_LEVEL` 锁定后，仍有写操作（`mavlink.cpp:331-336`），文本为 `Parameters locked`；
- 处理 `SECURE_COMMAND` 时返回参数设置结果（`mavlink_secure_command.cpp`，普通飞控集成不会用到）。

建议飞控把 `STATUSTEXT` 转发到日志系统。

### 6.5 不主动发送的报文

模块**不会**发送 `SYS_STATUS`、`ATTITUDE`、`GLOBAL_POSITION_INT`、`AUTOPILOT_VERSION` 等常规遥测。不要期待通过模块获取飞控状态；模块只负责 RID。

---

## 7. 时序、频率与时间戳

### 7.1 上电时序

```
飞控上电                                      RID 模块上电
   │                                              │
   │                                              ├─ UART1 打印启动横幅（ASCII）
   │                                              ├─ sysid = 0，每 2 s 打印
   │                                              │  "Waiting for heartbeat"
   │──── HEARTBEAT（type != GCS）───────────────►│
   │                                              ├─ 学习 sysid
   │◄─── HEARTBEAT（compid 236）1 Hz ─────────────┤
   │◄─── ARM_STATUS 1 Hz ─────────────────────────┤
   │                                              │
   │──── 12900 / 12901 / 12903 / 12904 / 12905 ──►│
   │                                              ├─ 组包、WiFi/BLE 广播
   │◄─── ARM_STATUS: GOOD_TO_ARM ─────────────────┤
```

要点：

- 飞控**不要等待模块心跳**再开始发送，否则会死锁（模块等飞控心跳学习 sysid，飞控等模块心跳）；
- 模块从收到第一条有效数据到给出 `GOOD_TO_ARM` 通常需要 1–2 秒；
- 预解锁判定有 3 s / 22 s 的宽限期，但建议从一开始就持续发送，避免起飞前才补数据。

### 7.2 频率建议

| 报文          | 建议频率    | 理由                                        |
| ------------- | ----------- | ------------------------------------------- |
| `LOCATION`    | **5–10 Hz** | 位置变化快，也是 RID 合规广播的核心数据     |
| `SYSTEM`      | 1 Hz        | 操控站位置变化慢，但超时只有 3 s            |
| `BASIC_ID`    | 1 Hz        | 内容基本不变                                |
| `SELF_ID`     | 1 Hz        | 超时 22 s，0.1 Hz 也够，但 1 Hz 更省心      |
| `OPERATOR_ID` | 1 Hz        | 同上                                        |
| `HEARTBEAT`   | 1 Hz        | 仅用于 sysid 学习，但保持 1 Hz 便于链路诊断 |

115200 波特率下，上述流量合计不到 2 kB/s，带宽非常充裕。即使降到 57600 也足够。

### 7.3 时间戳规则（最关键的兼容点）

| 报文                 | 字段语义                                          | 必须满足                        | 模块用途                                                   |
| -------------------- | ------------------------------------------------- | ------------------------------- | ---------------------------------------------------------- |
| `LOCATION.timestamp` | **UTC 整点后秒数**（0–3600，float）               | **非 0**；建议随真实时间变化    | 置 `LocationValid`；决定广播中的时间                       |
| `SYSTEM.timestamp`   | **自 2019-01-01 00:00:00 UTC 起的秒数**（uint32） | **非 0**；且 **3 秒内必须变化** | 置 `SystemValid`；刷新 `last_system_ms`；GB 广播的绝对时间 |

#### 7.3.1 OPEN_DRONE_ID_LOCATION.timestamp

- 不是 Unix 时间戳，不是开机时间；
- 推荐：`utc_seconds % 3600`，并保留 0.1 s 小数；
- 未知时可填 `0xFFFF`（65535），模块允许，但广播中就没有有效时间；
- 填 `0` 会导致模块不装配 Location 数据（`RemoteIDModule.ino:354`）。

#### 7.3.2 OPEN_DRONE_ID_SYSTEM.timestamp

MAVLink 定义中该字段是“**32 bit Unix Timestamp in seconds since 00:00:00 01/01/2019**”，即：

```c
uint32_t system_ts = (uint32_t)(unix_seconds - 1546300800ULL);
```

**不要直接填当前的 Unix 秒（约 1.7×10⁹）**。模块会再加回 `1546300800` 当作 Unix 时间使用：

```cpp
// gb46750.cpp:460-462
if (uas_data->SystemValid && uas_data->System.Timestamp != 0) {
    unix_ms = ((uint64_t)uas_data->System.Timestamp + ODID_EPOCH_UNIX_S) * 1000ULL;
}
```

如果误填 Unix 秒，广播中的时间会跳到 2075 年左右，GB 46750 接收端会认为时间异常。

#### 7.3.3 为什么 `SYSTEM.timestamp` 必须变化

`mavlink.cpp:212-216`：

```cpp
if ((last_system_timestamp != system.timestamp) || (system.timestamp == 0)) {
    last_system_ms = millis();
    last_system_timestamp = system.timestamp;
}
```

- 发送**常量**时间戳：第一次收到后 `last_system_ms` 不再刷新，3 秒后 ArmStatus 报 `SYS`；
- 发送 `0`：虽然 `last_system_ms` 会刷新，但 `SystemValid` 不会置位，模块不会使用任何 System 字段，操控站位置也不会广播；
- 正确做法：**非 0，且至少每秒变化一次**。

#### 7.3.4 没有 GNSS 时间怎么办

模块的 GB 广播优先使用飞控的 `SYSTEM.timestamp`；只有当它无效时，才回退到模块本地通过 `GB_UTC_TIME` / `GB_UTC8_TIME` 同步的时间（见 `gb46750.cpp:453-467`）。

推荐策略：

1. **飞控有 GNSS UTC（推荐）**：直接发送 `unix_seconds - 1546300800`。这是唯一能同时保证 `SystemValid` 和广播时间正确的方式。
2. **飞控暂时没有 UTC**：仍必须发送一个**非 0 且递增**的值，否则操控站位置不会进入广播、ArmStatus 会报 `OP_LOC`；但此时 GB 广播中的绝对时间就是错的。**不要把这种状态作为量产方案**，应尽快给飞控提供 UTC（GNSS 或外部授时）。
3. **模块本地时间（`GB_UTC_TIME`）的定位**：它只是“没有飞控或飞控 System 无效”时的兜底。只要飞控发送了非 0 的 `SYSTEM.timestamp`，模块就会优先使用飞控值，模块本地时间不再生效。因此不能通过“飞控发 0 + 模块设时间”来兼顾操控站位置和正确时间。
4. 绝对不要在 `SYSTEM.timestamp` 里填当前 Unix 秒（约 1.7×10⁹），否则广播时间会跳到 2075 年左右。

### 7.4 OPTIONS 与 BasicID 模式

`OPTIONS` 是 UINT8，默认值 **2**：

| bit | 宏                                         | 含义                                             |
| --- | ------------------------------------------ | ------------------------------------------------ |
| 0   | `OPTIONS_FORCE_ARM_OK`                     | 强制预解锁通过（跳过缺失检查）                   |
| 1   | `OPTIONS_DONT_SAVE_BASIC_ID_TO_PARAMETERS` | **默认置位**：BasicID 使用飞控实时数据，不写 NVS |
| 2   | `OPTIONS_PRINT_RID_MAVLINK`                | 在调试串口打印收到的 RID 报文类型                |

| 配置                       | BasicID 来源                                                                                                         | 飞控是否必须发 12900               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `OPTIONS` bit1 = 1（默认） | 飞控实时报文                                                                                                         | **必须**，否则不广播 BasicID       |
| `OPTIONS` bit1 = 0         | 参数 `UAS_ID` + `GB_UA_CLASS` / `GB_OP_CATEGORY`（`UAS_TYPE` / `UAS_ID_TYPE` 仅用于有效性判定）；飞控数据作为第二 ID | 建议发送，但不影响 BasicID[0] 广播 |

> 若产品希望“出厂写死 ID，飞控不用每次下发”，请在产线清除 `OPTIONS` bit1，并写入 `UAS_ID`（身份）以及 `GB_UA_CLASS` / `GB_OP_CATEGORY`（BasicID 类型与 GB 分类），同时保证 `UAS_TYPE` / `UAS_ID_TYPE` 非 0；否则保持默认，由飞控每次上电下发。

### 7.5 无数据时的广播行为

- `BCAST_POWERUP = 1`（默认）时，模块上电后立即开始广播；但此时可能没有任何有效数据（默认 `OPTIONS` 下 BasicID 也依赖飞控报文），或只有参数中已配置的 BasicID（`OPTIONS` bit1 清零时），位置/系统数据仍然缺失；
- 无效的数据（`timestamp == 0`、空 `uas_id` 等）会被**跳过**，不会出现在广播中；
- 模块不会因为数据过期而停止广播，但 ArmStatus 会持续报告缺失项。

---

## 8. 预解锁判据

模块的预解锁判定在 `Transport::arm_status_check()`（`transport.cpp:34-94`）中完成。

### 8.1 判定表

| 检查项            | 通过条件                                                | 失败标记       |
| ----------------- | ------------------------------------------------------- | -------------- |
| Location 新鲜度   | 3 秒内收到过 `LOCATION`                                 | `LOC`          |
| Location 有效性   | 纬度、经度不能同时为 0                                  | `LOC`          |
| System 新鲜度     | 3 秒内 `SYSTEM.timestamp` 变化过                        | `SYS`          |
| System 有效性     | 操控站经纬度不能同时为 0                                | `OP_LOC`       |
| SelfID 新鲜度     | 22 秒内收到过 `SELF_ID`                                 | `SELF_ID`      |
| OperatorID 新鲜度 | 22 秒内收到过 `OPERATOR_ID`                             | `OP_ID`        |
| BasicID（参数）   | 参数中 `UAS_ID` 非空且 `UAS_TYPE`、`UAS_ID_TYPE` 均非 0 | `ID`           |
| 编码合法性        | 所有字段在 OpenDroneID 编码范围内                       | `bad ... data` |

### 8.2 飞控侧策略建议

```c
/* 伪代码 */
if (now - rid_last_arm_status_ms > 3000) {
    /* 模块掉线：按整机策略决定是否禁止解锁 */
    rid_online = false;
} else {
    rid_online = true;
    rid_arm_ok = (rid_arm_status == MAV_ODID_ARM_STATUS_GOOD_TO_ARM);
}

if (boot_elapsed_ms < 10000) {
    /* 上电 10 秒内忽略 RID 预解锁结果，给模块初始化留时间 */
} else if (!rid_online) {
    /* 视产品策略：警告或禁止解锁 */
} else if (!rid_arm_ok) {
    /* 禁止解锁，并把 rid_arm_reason 显示到地面站 */
}
```

建议：

- **上电前 10 秒**忽略 RID 状态；
- 10 秒后 `status != 0` 禁止解锁；
- 把 `error` 文本透传到地面站，不要只显示一个笼统的“RID 未就绪”；
- 不要因为单次丢失 ArmStatus 就立即禁止解锁，配合 3 秒超时更稳妥。

---

## 9. 参数接口

模块通过标准 MAVLink 参数协议（`PARAM_REQUEST_LIST` / `PARAM_REQUEST_READ` / `PARAM_SET` / `PARAM_VALUE`）暴露部分参数。实现见 `mavlink.cpp:293-346`。

### 9.1 协议行为

| 操作                       | 行为                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `PARAM_REQUEST_LIST`（21） | 以 **20 Hz**（每 50 ms 一条）回复所有**非隐藏、数值型**参数                                       |
| `PARAM_REQUEST_READ`（20） | 按 `param_id` 或 `param_index` 回复；**隐藏参数不返回**                                           |
| `PARAM_SET`（23）          | **只接受 `MAV_PARAM_TYPE_REAL32`**；设置后回读并回复 `PARAM_VALUE`                                |
| 参数类型                   | 对飞控来说全部表现为 `REAL32`（UINT8/INT8/UINT32/FLOAT 均可）                                     |
| 字符串参数                 | **不能通过 MAVLink 读写**（`UAS_ID`、`GB_UTC_TIME` 等请用 Web/串口控制台）                        |
| 名称长度                   | 最多 16 字节；`param_id` 按 MAVLink 规范不以 `\0` 结尾                                            |
| 锁定                       | `LOCK_LEVEL > 0` 时拒绝所有写入，仅允许提高 `LOCK_LEVEL`；同时发送 STATUSTEXT `Parameters locked` |

> 参数名没有统一前缀，直接使用 `BAUDRATE`、`OPTIONS` 等名称。

### 9.2 常用参数

| 参数                           | 类型   | 默认值     | 范围        | 说明                                                   |
| ------------------------------ | ------ | ---------- | ----------- | ------------------------------------------------------ |
| `BAUDRATE`                     | UINT32 | 115200     | 9600–921600 | 串口波特率（飞控口 + 调试口），需重启                  |
| `MAVLINK_SYSID`                | UINT8  | 0          | 0–254       | 0 = 从飞控心跳学习；非 0 = 固定 sysid                  |
| `OPTIONS`                      | UINT8  | 2          | 0–254       | bit0 强制解锁、bit1 不保存 BasicID、bit2 打印 RID 报文 |
| `UDP_FWD_EN`                   | UINT8  | 1          | 0–1         | 飞控 ↔ 地面站 UDP 转发                                 |
| `BCAST_POWERUP`                | UINT8  | 1          | 0–1         | 上电即广播                                             |
| `GB_BLE_RATE`                  | FLOAT  | 1          | 0–5         | GB BLE 广播频率 Hz（0 = 关闭）                         |
| `GB_WIFI_BCN_RATE`             | FLOAT  | 1          | 0–5         | GB WiFi Beacon 频率 Hz（0 = 关闭）                     |
| `GB_WIFI_NAN_RATE`             | FLOAT  | 1          | 0–5         | GB WiFi NAN 频率 Hz（0 = 关闭）                        |
| `GB_REALNAME`                  | CHAR8  | `12345678` | —           | 实名登记标志（身份证后 8 位）                          |
| `GB_UTC_TIME` / `GB_UTC8_TIME` | CHAR20 | 空         | —           | 一次性设置模块本地时间，写入后自动清空                 |
| `WEBSERVER_EN`                 | UINT8  | 1          | 0–1         | Web 配置界面                                           |

`UAS_TYPE`、`UAS_ID_TYPE`、`UAS_ID`、`LOCK_LEVEL` 等为隐藏参数：它们不会出现在 `PARAM_REQUEST_LIST` 的结果中，也不能通过 `PARAM_REQUEST_READ` 读取。请使用 Web 界面或调试控制台配置，**不要把“通过 MAVLink 写隐藏参数”当作接口约定**。

---

## 10. 参考实现

以下代码使用官方 MAVLink C 库。飞控移植时把 `MAVLINK_COMM_0` 换成自己的 MAVLink 通道宏、把数据源换成飞控内部状态即可。

### 10.1 调度框架

```c
/*
 * 100 Hz 调用
 *  - Location 10 Hz
 *  - 其余 1 Hz
 */
void rid_update_100hz(void)
{
    static uint8_t div10 = 0;

    /* ---------- Location：10 Hz ---------- */
    mavlink_open_drone_id_location_t loc = {0};

    loc.status             = airborne ? MAV_ODID_STATUS_AIRBORNE
                                      : MAV_ODID_STATUS_GROUND;
    loc.direction          = (uint16_t)(ground_course_deg * 100.0f);  /* cdeg，运动方向 */
    loc.speed_horizontal   = (uint16_t)(ground_speed_mps * 100.0f);   /* cm/s */
    loc.speed_vertical     = (int16_t)(climb_rate_mps * 100.0f);      /* cm/s，上升为正 */
    loc.latitude           = lat_e7;
    loc.longitude          = lon_e7;
    loc.altitude_barometric = alt_baro_m;
    loc.altitude_geodetic  = alt_geo_m;
    loc.height_reference   = MAV_ODID_HEIGHT_REF_OVER_TAKEOFF;
    loc.height             = height_m;
    loc.horizontal_accuracy = MAV_ODID_HOR_ACC_3_METER;
    loc.vertical_accuracy   = MAV_ODID_VER_ACC_3_METER;
    loc.barometer_accuracy  = MAV_ODID_VER_ACC_3_METER;
    loc.speed_accuracy      = MAV_ODID_SPEED_ACC_1_METERS_PER_SECOND;
    loc.timestamp           = (float)(utc_ms % 3600000ULL) / 1000.0f;  /* 整点后秒数 */
    loc.timestamp_accuracy  = MAV_ODID_TIME_ACC_0_1_SECOND;

    mavlink_msg_open_drone_id_location_send_struct(MAVLINK_COMM_0, &loc);

    /* ---------- 1 Hz ---------- */
    if (++div10 >= 10) {
        div10 = 0;
        rid_send_1hz();
    }
}

/* 1 Hz 调用 */
static void rid_send_1hz(void)
{
    /* 心跳：让模块学习 sysid */
    mavlink_msg_heartbeat_send(MAVLINK_COMM_0,
                               MAV_TYPE_QUADROTOR,
                               MAV_AUTOPILOT_GENERIC,
                               0, 0, 0);

    /* BasicID：默认 OPTIONS 下必须发送，uas_id 不能为空 */
    mavlink_open_drone_id_basic_id_t basic = {0};
    basic.id_type = MAV_ODID_ID_TYPE_SERIAL_NUMBER;
    basic.ua_type = MAV_ODID_UA_TYPE_HELICOPTER_OR_MULTIROTOR;
    strncpy((char *)basic.uas_id, "1596F39TEST000000001",
            sizeof(basic.uas_id));
    mavlink_msg_open_drone_id_basic_id_send_struct(MAVLINK_COMM_0, &basic);

    /* SelfID：即使内容为空也要发，否则 ArmStatus 报 SELF_ID */
    mavlink_open_drone_id_self_id_t self = {0};
    self.description_type = MAV_ODID_DESC_TYPE_TEXT;
    strncpy(self.description, "survey mission", sizeof(self.description));
    mavlink_msg_open_drone_id_self_id_send_struct(MAVLINK_COMM_0, &self);

    /* OperatorID：至少 8 字节才会覆盖参数 GB_REALNAME */
    mavlink_open_drone_id_operator_id_t op = {0};
    op.operator_id_type = MAV_ODID_OPERATOR_ID_TYPE_CAA;
    strncpy(op.operator_id, "12345678", sizeof(op.operator_id));
    mavlink_msg_open_drone_id_operator_id_send_struct(MAVLINK_COMM_0, &op);

    /* System：timestamp = Unix 秒 - 1546300800，必须每秒变化 */
    mavlink_open_drone_id_system_t sys = {0};
    sys.operator_location_type = MAV_ODID_OPERATOR_LOCATION_TYPE_LIVE_GNSS;
    sys.classification_type    = MAV_ODID_CLASSIFICATION_TYPE_UNDECLARED;
    sys.operator_latitude      = operator_lat_e7;
    sys.operator_longitude     = operator_lon_e7;
    sys.area_count             = 1;
    sys.area_ceiling           = -1000.0f;
    sys.area_floor             = -1000.0f;
    sys.category_eu            = MAV_ODID_CATEGORY_EU_UNDECLARED;
    sys.class_eu               = MAV_ODID_CLASS_EU_UNDECLARED;
    sys.operator_altitude_geo  = operator_alt_m;
    sys.timestamp              = (uint32_t)(unix_seconds - 1546300800ULL);
    mavlink_msg_open_drone_id_system_send_struct(MAVLINK_COMM_0, &sys);
}
```

> 注意：官方 MAVLink 的 `*_send()` 便捷函数会按**字段长度**从字符串指针复制数据。直接把短字符串字面量传给 `mavlink_msg_open_drone_id_self_id_send()` 这类函数，可能发生越界读取。示例改用零初始化结构体 + `*_send_struct()`（或使用长度足够、补 `0` 的缓冲区），这也是飞控侧推荐的做法。

### 10.2 接收 ArmStatus

```c
void rid_handle_mavlink(const mavlink_message_t *msg)
{
    if (msg->msgid == MAVLINK_MSG_ID_OPEN_DRONE_ID_ARM_STATUS) {
        mavlink_open_drone_id_arm_status_t st;
        mavlink_msg_open_drone_id_arm_status_decode(msg, &st);

        rid_last_arm_status_ms = now_ms();
        rid_arm_ok = (st.status == MAV_ODID_ARM_STATUS_GOOD_TO_ARM);

        memset(rid_arm_reason, 0, sizeof(rid_arm_reason));
        strncpy(rid_arm_reason, st.error, sizeof(rid_arm_reason) - 1);
    }
}
```

### 10.3 数据源对照

| 飞控内部量      | 发送字段                       | 换算                  |
| --------------- | ------------------------------ | --------------------- |
| 纬度（度）      | `latitude`                     | `deg × 1e7`           |
| 经度（度）      | `longitude`                    | `deg × 1e7`           |
| 地速（m/s）     | `speed_horizontal`             | `× 100` → cm/s        |
| 垂直速度（m/s） | `speed_vertical`               | `× 100` → cm/s        |
| 航迹角（度）    | `direction`                    | `× 100` → cdeg        |
| 高度（m）       | `altitude_geodetic` / `height` | 米，float             |
| UTC 时间        | `LOCATION.timestamp`           | 整点后秒数            |
| UTC 时间        | `SYSTEM.timestamp`             | `unix_s - 1546300800` |

---

## 11. 联调与排障

### 11.1 上电检查清单

1. 飞控 UART 与模块 `BAUDRATE` 一致（默认 115200）；
2. 8N1，无流控；
3. TX/RX 交叉，GND 共地；
4. 飞控使用 MAVLink 2 帧；
5. 飞控上电即发 `HEARTBEAT`，`type != GCS`；
6. 模块收到心跳后开始发 1 Hz 心跳和 ArmStatus（`compid = 236`）；
7. 五类 RID 报文都在发送；
8. `LOCATION.timestamp`、`SYSTEM.timestamp` 非 0；
9. `SYSTEM.timestamp` 每秒变化；
10. 经纬度、操控站经纬度不是 `0,0`；
11. 默认 `OPTIONS = 2` 时，`BASIC_ID.uas_id` 非空。

### 11.2 常见问题

| 现象                                             | 可能原因                                                                                | 排查方法                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 模块串口完全无输出                               | 波特率不一致；TX/RX 接反；未共地                                                        | 用示波器/串口分析仪看 UART1 TX；模块控制台是否持续打印 `Waiting for heartbeat` |
| 模块打印 `Waiting for heartbeat`，但飞控在发心跳 | 心跳 `type == MAV_TYPE_GCS`；`sysid == 0`；帧 CRC 错误；飞控发的是 MAVLink 1 且字段错误 | 抓包确认心跳 `sysid/type`；确认使用 MAVLink 2                                  |
| 模块有心跳，但地面站看不到 RID 组件              | 模块 sysid 与飞控不一致                                                                 | 检查 `MAVLINK_SYSID`，默认应为 0                                               |
| ArmStatus 一直 `LOC`                             | Location 未发、超时、经纬度为 0、`timestamp == 0`                                       | 检查 5.3 节                                                                    |
| ArmStatus 一直 `SYS`                             | System 未发、`timestamp == 0`、或时间戳恒定不变                                         | 检查 5.4 节与 7.3 节                                                           |
| ArmStatus 一直 `SELF_ID`                         | SelfID 未发                                                                             | 补发 12903（空内容也算收到）                                                   |
| ArmStatus 一直 `OP_ID`                           | OperatorID 未发                                                                         | 补发 12905                                                                     |
| ArmStatus 报 `OP_LOC`                            | 操控站经纬度为 `0,0`                                                                    | 填写操控站/起飞点坐标                                                          |
| ArmStatus 报 `bad LOC data`                      | 经纬度、速度、方向、高度越界                                                            | 对照 5.3 节范围                                                                |
| ArmStatus 报 `bad SYS data`                      | 操控站坐标、区域半径、高度越界                                                          | 对照 5.4 节范围                                                                |
| BasicID 不广播                                   | 默认 `OPTIONS` 下 `uas_id` 为空                                                         | 发送非空 `uas_id`                                                              |
| 广播时间戳异常（2075 年）                        | `SYSTEM.timestamp` 误填 Unix 秒                                                         | 改为 `unix_s - 1546300800`                                                     |
| 参数读取不到                                     | 参数是字符串或隐藏参数                                                                  | 用 Web/串口控制台                                                              |
| 参数写不进去                                     | `MAV_PARAM_TYPE_REAL32` 不匹配；`LOCK_LEVEL > 0`                                        | 检查 `param_type`；确认未锁定                                                  |

### 11.3 调试工具

1. **模块 Web 界面**
   - 模块默认开启 WiFi AP，SSID 为 `NP-RID_<MAC>`，密码默认 `nextpilot`；
   - 浏览器访问 `http://192.168.4.1`；
   - 页面可查看模块实际解析到的 `BASICID`、`SYSTEM`、`LOCATION` 字段和状态原因，是验证飞控发送内容最快的工具。

2. **调试串口控制台**
   - 默认 115200 8N1；
   - `help`、`param list`、`param get NAME`、`param set NAME VALUE`；
   - 可临时 `param set OPTIONS 6`（bit1 + bit2）打开 RID 报文打印，在控制台看到模块收到的报文类型。调试完请改回 `2`。

3. **地面站（QGC）**
   - 连接模块 WiFi AP 后，QGC 监听 UDP 14550 即可看到飞控遥测和 RID 组件（`compid = 236`）；
   - 也可用来观察模块是否把飞控数据转发出去。

4. **串口分析仪**
   - 在飞控 TX 线上抓包，确认帧起始符是 `0xFD`（MAVLink 2）；
   - 确认 `msgid` 为 12900–12905 / 12919；
   - 确认 `LOCATION` 的 `timestamp` 字段在变化。

### 11.4 LED 状态

模块 LED 只反映**预解锁检查是否通过**，但颜色/亮灭**因板卡而异**：

- 多数 WS2812 板卡：通过 = 绿色，未通过 = 红色；
- `ESP32S3_DEV` 的固件定义相反：通过 = 红色，未通过 = 绿色；
- 使用单色 `STATUS_LED` 的板卡：通过时点亮还是熄灭取决于 `STATUS_LED_OK` 的取值。

因此不要把 LED 颜色当作跨板卡的通用判据。调试时请以飞控收到的 ArmStatus `error` 为准；即使 LED 表示失败，模块仍会继续广播已有数据，只是数据可能不完整。

---

## 12. 附录

### A. 报文定义与 CRC extra

| 报文                           | msgid | 负载长度 | CRC extra | 方向               |
| ------------------------------ | ----- | -------- | --------- | ------------------ |
| `HEARTBEAT`                    | 0     | 9        | 50        | 双向               |
| `OPEN_DRONE_ID_BASIC_ID`       | 12900 | 44       | 114       | FC → RID           |
| `OPEN_DRONE_ID_LOCATION`       | 12901 | 59       | 254       | FC → RID           |
| `OPEN_DRONE_ID_AUTHENTICATION` | 12902 | 53       | 140       | FC → RID（可省略） |
| `OPEN_DRONE_ID_SELF_ID`        | 12903 | 46       | 249       | FC → RID           |
| `OPEN_DRONE_ID_SYSTEM`         | 12904 | 54       | 77        | FC → RID           |
| `OPEN_DRONE_ID_OPERATOR_ID`    | 12905 | 43       | 49        | FC → RID           |
| `OPEN_DRONE_ID_ARM_STATUS`     | 12918 | 51       | 139       | RID → FC           |
| `OPEN_DRONE_ID_SYSTEM_UPDATE`  | 12919 | 18       | 7         | FC → RID（可选）   |

> `OPEN_DRONE_ID_MESSAGE_PACK`（12920）不被本固件处理。

### B. 常用枚举

**`MAV_ODID_ID_TYPE`**

| 值  | 名称                  | 含义                 |
| --- | --------------------- | -------------------- |
| 0   | `NONE`                | 未定义（模块不接受） |
| 1   | `SERIAL_NUMBER`       | 制造商序列号         |
| 2   | `CAA_REGISTRATION_ID` | CAA 登记号           |
| 3   | `UTM_ASSIGNED_UUID`   | UTM UUID             |
| 4   | `SPECIFIC_SESSION_ID` | 特定会话 ID          |

**`MAV_ODID_UA_TYPE`**

| 值  | 名称                                        |
| --- | ------------------------------------------- |
| 0   | `NONE`                                      |
| 1   | `AEROPLANE`（固定翼）                       |
| 2   | `HELICOPTER_OR_MULTIROTOR`（直升机/多旋翼） |
| 3   | `GYROPLANE`                                 |
| 4   | `HYBRID_LIFT`（垂直起降）                   |
| 5   | `ORNITHOPTER`                               |
| 6   | `GLIDER`                                    |
| 7   | `KITE`                                      |
| 8   | `FREE_BALLOON`                              |
| 9   | `CAPTIVE_BALLOON`                           |
| 10  | `AIRSHIP`                                   |
| 11  | `FREE_FALL_PARACHUTE`                       |
| 12  | `ROCKET`                                    |
| 13  | `TETHERED_POWERED_AIRCRAFT`                 |
| 14  | `GROUND_OBSTACLE`                           |
| 15  | `OTHER`                                     |

**`MAV_ODID_STATUS`**

| 值  | 名称                       |
| --- | -------------------------- |
| 0   | `UNDECLARED`               |
| 1   | `GROUND`                   |
| 2   | `AIRBORNE`                 |
| 3   | `EMERGENCY`                |
| 4   | `REMOTE_ID_SYSTEM_FAILURE` |

**`MAV_ODID_OPERATOR_LOCATION_TYPE`**

| 值  | 名称                            |
| --- | ------------------------------- |
| 0   | `TAKEOFF`（操控站与起飞点相同） |
| 1   | `LIVE_GNSS`（操控站实时 GNSS）  |
| 2   | `FIXED`（固定位置）             |

**`MAV_ODID_ARM_STATUS`**

| 值  | 名称                   |
| --- | ---------------------- |
| 0   | `GOOD_TO_ARM`          |
| 1   | `PRE_ARM_FAIL_GENERIC` |

**`MAV_ODID_HOR_ACC`（水平精度）**

| 值  | 含义               |
| --- | ------------------ |
| 0   | 未知               |
| 1   | <10 NM（18.52 km） |
| 2   | <4 NM（7.408 km）  |
| 3   | <2 NM（3.704 km）  |
| 4   | <1 NM（1.852 km）  |
| 5   | <0.5 NM（926 m）   |
| 6   | <0.3 NM（555.6 m） |
| 7   | <0.1 NM（185.2 m） |
| 8   | <0.05 NM（92.6 m） |
| 9   | <30 m              |
| 10  | <10 m              |
| 11  | <3 m               |
| 12  | <1 m               |

**`MAV_ODID_VER_ACC`（垂直精度）**

| 值  | 含义   |
| --- | ------ |
| 0   | 未知   |
| 1   | <150 m |
| 2   | <45 m  |
| 3   | <25 m  |
| 4   | <10 m  |
| 5   | <3 m   |
| 6   | <1 m   |

**`MAV_ODID_SPEED_ACC`（速度精度）**

| 值  | 含义     |
| --- | -------- |
| 0   | 未知     |
| 1   | <10 m/s  |
| 2   | <3 m/s   |
| 3   | <1 m/s   |
| 4   | <0.3 m/s |

**`MAV_ODID_TIME_ACC`（时间精度）**

| 值  | 含义   |
| --- | ------ |
| 0   | 未知   |
| 1   | ≤0.1 s |
| 2   | ≤0.2 s |
| …   | …      |
| 15  | ≤1.5 s |

### C. 关键代码位置

| 功能                              | 文件                                                      |
| --------------------------------- | --------------------------------------------------------- |
| 串口 MAVLink 收发、报文分发       | `RemoteIDModule/mavlink.cpp`                              |
| 预解锁判定                        | `RemoteIDModule/transport.cpp`                            |
| 数据组装、BasicID/OperatorID 策略 | `RemoteIDModule/RemoteIDModule.ino:216-392`               |
| 参数定义                          | `RemoteIDModule/parameters.cpp`                           |
| 板卡引脚                          | `RemoteIDModule/board_config.h`                           |
| UDP 转发                          | `RemoteIDModule/transfer_udp.cpp`                         |
| GB 广播组包与时间戳               | `RemoteIDModule/gb46750.cpp:453-467`                      |
| OpenDroneID 编码范围检查          | `modules/opendroneid-core-c/libopendroneid/opendroneid.c` |

### D. 参考资料

- MAVLink OpenDroneID 服务：<https://mavlink.io/en/services/opendroneid.html>
- MAVLink `common` 消息定义：<https://mavlink.io/en/messages/common.html>
- ArduPilot 参考实现：`AP_OpenDroneID`（<https://github.com/ArduPilot/ardupilot>）。ArduPilot 侧串口需配置为 MAVLink2（`SERIALx_PROTOCOL = 2`），固件需启用 `AP_OPENDRONEID_ENABLED`。
- ASTM F3411 Remote ID and Tracking
- GB 46750《民用无人驾驶航空器系统运行识别规范》
