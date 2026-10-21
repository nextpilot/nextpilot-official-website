---
title: 第三方飞控与RemoteID发射模块适配说明
shortTitle: 飞控CAN适配说明
description: RemoteID模块通过DroneCAN与飞控连接，这里详细描述二者连接原理，为飞控开发人员开发RemoteID功能提供指导
summary: RemoteID模块通过DroneCAN与飞控连接，这里详细描述二者连接原理，为飞控开发人员开发RemoteID功能提供指导
date: 2026-10-18
category: DroneCAN
tags: [无人机运行识别广播, DroneCAN, 飞控适配, PX4, RemoteID]
cover: /assets/images/blog/DroneCAN_logo.png
---

# RemoteID模块CAN适配说明

本指南说明第三方飞控固件如何通过 DroneCAN 与 RemoteID 模块通信，实现：

- 飞控 → RID 模块：上报无人机身份、位置、系统信息
- RID 模块 → 飞控：回传预解锁状态（ArmStatus），供飞控做起飞前检查

> 若飞控使用 串口 连接，请参阅 [RemoteID模块MAVLink串口适配说明](MAVLink_serial.md)。两者数据语义基本一致，但**串口链路的超时与时间戳判定存在差异**，不能直接照搬。

---

## 目录

1. [系统概述](#1-系统概述)
2. [物理层与链路层](#2-物理层与链路层)
3. [DroneCAN 协议层](#3-dronecan-协议层)
4. [飞控 → RID 模块的消息](#4-飞控--rid-模块的消息)
5. [RID 模块 → 飞控的消息](#5-rid-模块--飞控的消息)
6. [时序与发送频率](#6-时序与发送频率)
7. [模块侧的数据校验](#7-模块侧的数据校验)
8. [参考实现](#8-参考实现)
9. [调试与排障](#9-调试与排障)
10. [附录](#10-附录)

---

## 1. 系统概述

```
┌──────────────┐   CAN 2.0B / 1 Mbps    ┌───────────────────┐
│    飞控       │◄──── 29-bit 扩展帧 ────►│  RemoteID     │
│              │                          │  (ESP32 + TWAI)   │
│ DroneCAN     │   20030~20034 广播 ────► │                   │
│ (libcanard)  │                          │  WiFi / BLE 广播  │
│              │◄─── 20035 ArmStatus ───  │                   │
└──────────────┘                          └───────────────────┘
```

- 模块在 CAN 总线上是一个**标准 DroneCAN 节点**
- 飞控主动周期性广播 5 类 `dronecan.remoteid.*` 消息
- 模块周期性广播 `ArmStatus` 与 `NodeStatus`
- 模块同时支持 `GetNodeInfo` / `Param.GetSet` / `RestartNode` / `SecureCommand` 服务

---

## 2. 物理层与链路层

### 2.1 电气参数

| 项目     | 要求                               |
| -------- | ---------------------------------- |
| 总线标准 | CAN 2.0B（经典 CAN，非 CAN FD）    |
| 波特率   | **1 Mbit/s**（模块写死，不可配置） |
| 帧类型   | **29 位扩展帧**（Extended ID）     |
| 终端电阻 | 总线两端各 120 Ω                   |
| 采样点   | 80%，SJW = 3（模块侧）             |

> 模块的位时序由 `TWAI_TIMING_CONFIG_1MBITS()` 写死，见 `CANDriver.cpp:36`。飞控侧也必须配置为 1 Mbps，否则完全无法通信。

### 2.2 硬件验收过滤器（关键）

模块在 TWAI 层设置了一个**基于优先级的硬件过滤器**（`DroneCAN.cpp:70-71`）：

```c
acceptance_code = 0x10000000U << 3;
acceptance_mask = 0x0FFFFFFFU << 3;
```

效果：**只接收 CAN ID bit28 = 1 的帧，即传输优先级 ≥ 16**。

| 优先级常量                         | 值  | 模块是否接收 |
| ---------------------------------- | --- | ------------ |
| `CANARD_TRANSFER_PRIORITY_HIGHEST` | 0   | ✗            |
| `CANARD_TRANSFER_PRIORITY_HIGH`    | 8   | ✗            |
| `CANARD_TRANSFER_PRIORITY_MEDIUM`  | 16  | ✓            |
| `CANARD_TRANSFER_PRIORITY_LOW`     | 24  | ✓            |
| `CANARD_TRANSFER_PRIORITY_LOWEST`  | 31  | ✓            |

**飞控发送 RID 数据、以及向模块发起的服务请求，必须使用 `MEDIUM` 或更低的优先级。** 使用 `HIGH` / `HIGHEST` 时模块在硬件层就丢弃了，软件层完全看不到，排查时非常隐蔽。

### 2.3 节点 ID

| 场景                        | 做法                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| 模块 `CAN_NODE = 0`（默认） | 模块作为 **DNA 客户端**，向总线请求节点 ID。飞控必须运行 DNA 分配器（ArduPilot 默认支持） |
| 模块 `CAN_NODE = 1..127`    | 模块使用固定节点 ID，无需 DNA                                                             |

飞控自身的节点 ID 与模块无关，正常配置即可。

如果飞控侧没有实现 DNA 分配器，请通过模块的 Web 界面或串口控制台把 `CAN_NODE` 设为非 0 值。

---

## 3. DroneCAN 协议层

推荐直接移植 **[libcanard](https://github.com/dronecan/libcanard)**（本仓库 `libraries/libcanard/`），它负责分片、CRC、transfer ID 管理等全部细节。以下内容用于理解与排障。

### 3.1 29 位 CAN ID 位域

| 位    | 宽度 | 含义                      |
| ----- | ---- | ------------------------- |
| 28:24 | 5    | 传输优先级                |
| 23:8  | 16   | 广播报文：Data Type ID    |
| 23:16 | 8    | 服务报文：Service Type ID |
| 15    | 1    | 服务：1 = 请求，0 = 响应  |
| 14:8  | 7    | 目标节点 ID               |
| 7     | 1    | 1 = 服务，0 = 广播消息    |
| 6:0   | 7    | 源节点 ID                 |

例：飞控节点 ID = 42，以 MEDIUM 优先级发送 BasicID（Data Type ID = 20030）：

```
CAN ID = (16 << 24) | (20030 << 8) | 42 = 0x104E3E2A
```

### 3.2 广播 vs 服务

| 类型              | 用途               | 例子                                     |
| ----------------- | ------------------ | ---------------------------------------- |
| 广播（Broadcast） | 周期性数据，无应答 | BasicID / Location / System / ArmStatus  |
| 服务（Service）   | 请求-响应，点对点  | GetNodeInfo、Param.GetSet、SecureCommand |

### 3.3 多帧分片

经典 CAN 每帧最多 8 字节，其中最后 1 字节是 **tail byte**：

| 位  | 含义                       |
| --- | -------------------------- |
| 7   | SOT（起始帧）              |
| 6   | EOT（结束帧）              |
| 5   | toggle（交替位，丢帧检测） |
| 4:0 | transfer ID                |

- **单帧**：载荷 ≤ 7 字节，tail = `0xC0 | tid`
- **多帧**：第一帧的 `data[0..1]` 是 **CRC-16**（对 `签名 + 载荷` 计算），其后才是数据；其余帧为 7 字节数据 + tail

RID 的 5 类消息除极短的 ArmStatus 外都是多帧，**不要自己 memcpy 成单帧发送**。

### 3.4 DSDL 编码规则

- 字段按声明顺序**逐位**打包，**LSB first**
- 变长数组前置 **5 位长度**
- **TAO（Tail Array Optimization）**：每条消息的**最后一个**变长数组省略长度字段，接收端用剩余长度反推
- `float32` / `int32` / `uint16` 等标量按小端写入

> TAO 是手工解析时最容易出错的地方。`BasicID.uas_id`、`SelfID.description`、`OperatorID.operator_id` 都没有长度前缀。

### 3.5 签名校验

模块的 `shouldAcceptTransfer()` 会校验 Data Type Signature。签名不匹配的报文会被**静默丢弃**。如果换了 DSDL 版本导致 CRC 签名变化，现象就是"总线有帧但模块没反应"。请使用下表中的签名。

---

## 4. 飞控 → RID 模块的消息

### 4.1 总览

| 消息                           | Data Type ID   | 签名                 | 最大载荷 | 建议频率 | 模块超时 |
| ------------------------------ | -------------- | -------------------- | -------- | -------- | -------- |
| `dronecan.remoteid.BasicID`    | 20030 (0x4E3E) | `0x5B1C624A8E4FC533` | 44 B     | 1 Hz     | 无       |
| `dronecan.remoteid.Location`   | 20031 (0x4E3F) | `0xEAA3A2C5BCB14CAA` | 58 B     | 1–10 Hz  | **3 s**  |
| `dronecan.remoteid.SelfID`     | 20032 (0x4E40) | `0x59BE81DC4C06A185` | 46 B     | 1 Hz     | 22 s     |
| `dronecan.remoteid.System`     | 20033 (0x4E41) | `0x9AC872F49BF32437` | 53 B     | 1 Hz     | **3 s**  |
| `dronecan.remoteid.OperatorID` | 20034 (0x4E42) | `0x581E7FC7F03AF935` | 43 B     | 1 Hz     | 22 s     |

**最小可用集**：要拿到 `GOOD_TO_ARM`，这 5 类消息必须**全部**持续发送。只发 BasicID + Location 不够。

### 4.2 BasicID（20030）

```
uint8[<=20] id_or_mac    // 转播他人 RID 时用；飞控直发留空
uint8       id_type
uint8       ua_type
uint8[<=20] uas_id       // TAO：无长度前缀
```

| 字段        | 说明                 | 有效值                                                |
| ----------- | -------------------- | ----------------------------------------------------- |
| `id_or_mac` | 来源标识             | `len = 0`                                             |
| `id_type`   | 身份类型             | 1 = 序列号，2 = CAA 登记号，3 = UTM UUID，4 = 会话 ID |
| `ua_type`   | 无人机类型           | 1 = 固定翼，2 = 多旋翼，3 = 滑翔机，…，15 = 其他      |
| `uas_id`    | ASCII，不足补 `0x00` | 最多 20 字节                                          |

**模块处理**（`DroneCAN.cpp:502-517`）：

- 只接受 `uas_id.len > 0` 且 `1 ≤ id_type ≤ 4` 的报文
- 若 `OPTIONS` 的 bit1（`DONT_SAVE_BASIC_ID_TO_PARAMETERS`）**置位**：直接使用飞控实时数据
- 若**未置位**：首次收到的有效 BasicID 会被写入 NVS（`UAS_TYPE` / `UAS_ID_TYPE` / `UAS_ID`），之后即使飞控停发也会继续广播

> 本仓库参数表中 `OPTIONS` 的出厂默认值是 `2`，即默认使用飞控实时数据。

### 4.3 Location（20031）

```
uint8[<=20] id_or_mac
uint8       status
uint16      direction              // cdeg，0~35999
uint16      speed_horizontal       // cm/s
int16       speed_vertical         // cm/s，上升为正
int32       latitude               // degE7
int32       longitude              // degE7
float32     altitude_barometric    // m
float32     altitude_geodetic      // m
uint8       height_reference
float32     height                 // m
uint8       horizontal_accuracy
uint8       vertical_accuracy
uint8       barometer_accuracy
uint8       speed_accuracy
float32     timestamp              // 整点后秒数
uint8       timestamp_accuracy
```

| 字段                  | 取值            | 说明                                           |
| --------------------- | --------------- | ---------------------------------------------- |
| `status`              | 0–15            | 0 未声明，1 地面，2 空中，3 紧急，4/5 RID 失效 |
| `direction`           | 0–360           | 361 表示未知                                   |
| `speed_horizontal`    | 0–254.25        | 255 表示未知                                   |
| `speed_vertical`      | −62 – +62       | 63 表示未知                                    |
| `latitude`            | −90 – +90       | `deg × 1e7`                                    |
| `longitude`           | −180 – +180     | `deg × 1e7`                                    |
| `altitude_barometric` | −1000 – 31767.5 | m                                              |
| `altitude_geodetic`   | −1000 – 31767.5 | m                                              |
| `height_reference`    | 0 / 1           | 0 相对起飞点，1 相对地面                       |
| `height`              | −1000 – 31767.5 | m                                              |
| `*_accuracy`          | 0–15            | ASTM NACp / NACv / GVA 枚举                    |
| `timestamp`           | 0–3600          | 整点后的秒数                                   |
| `timestamp_accuracy`  | 0–15            | 1 = 0.1 s，…，8 = 10 ms                        |

**模块处理**（`DroneCAN.cpp:572-601`）：

- `last_location_ms` **只在 `timestamp` 变化时刷新**
- 数据会被送进 `encodeLocationMessage()` 做范围检查，越界时 ArmStatus 会报 `bad LOC data`

### 4.4 System（20033）

```
uint8[<=20] id_or_mac
uint8       operator_location_type   // 0 起飞点，1 实时GNSS，2 固定
uint8       classification_type      // 0 = EU
int32       operator_latitude        // degE7
int32       operator_longitude       // degE7
uint16      area_count
uint16      area_radius              // m
float32     area_ceiling             // m
float32     area_floor               // m
uint8       category_eu
uint8       class_eu
float32     operator_altitude_geo    // m
uint32      timestamp                // Unix 秒
```

| 字段                                                    | 取值                       |
| ------------------------------------------------------- | -------------------------- |
| `operator_location_type`                                | 0–3                        |
| `classification_type`                                   | 0–7                        |
| `area_radius`                                           | 0–2550                     |
| `area_ceiling` / `area_floor` / `operator_altitude_geo` | −1000 – 31767.5            |
| `timestamp`                                             | **必须非 0**，且随时间递增 |

**模块处理**（`DroneCAN.cpp:531-557`）：

- `timestamp != 0` 才会置 `SystemValid`（`RemoteIDModule.ino:350`）
- `last_system_ms` 只在 `timestamp` 变化时刷新
- 遥控站经纬度不能同时为 0，否则 ArmStatus 报 `OP_LOC`

### 4.5 SelfID（20032）

```
uint8[<=20] id_or_mac
uint8       description_type    // 0 = 文本
uint8[<=23] description         // TAO：无长度前缀
```

| 字段               | 说明                          |
| ------------------ | ----------------------------- |
| `description_type` | 0 表示纯文本                  |
| `description`      | ASCII，最多 23 字节，不足补 0 |

内容可以是机型说明、任务描述等。**即使没有实际内容也要周期发送**（可发一个空格），否则 ArmStatus 会报 `SELF_ID`。

### 4.6 OperatorID（20034）

```
uint8[<=20] id_or_mac
uint8       operator_id_type    // 0 = CAA
uint8[<=20] operator_id         // TAO：无长度前缀
```

| 字段               | 说明                    |
| ------------------ | ----------------------- |
| `operator_id_type` | 0                       |
| `operator_id`      | ASCII，通常为实名登记号 |

**注意**：本模块实际广播的 ASTM OperatorID 内容优先取自参数 `GB_REALNAME`（默认 `"12345678"`），仅在 `OPTIONS` bit1 置位且飞控发送的 ID 长度 ≥ 8 时才使用飞控数据。但**飞控仍必须周期发送该消息**，否则 `last_operator_id_ms` 为 0，ArmStatus 会一直报 `OP_ID`。

---

## 5. RID 模块 → 飞控的消息

### 5.1 ArmStatus（20035）— 最重要的反馈

| 项           | 值                             |
| ------------ | ------------------------------ |
| Data Type ID | 20035 (0x4E43)                 |
| 签名         | `0xFEDF72CCF06F3BDD`           |
| 类型         | 广播                           |
| 频率         | 1 Hz（节点 ID 分配成功后开始） |

```
uint8         status      // 0 = GOOD_TO_ARM, 1 = PRE_ARM_FAIL_GENERIC
uint8[<=50]   error       // 失败原因文本，TAO
```

飞控应把 `status != 0` 作为**禁止解锁**的条件，并把 `error` 显示到地面站/日志。

`error` 中可能出现的标记：

| 标记            | 含义                                     |
| --------------- | ---------------------------------------- |
| `LOC`           | 位置数据缺失、过期（>3 s）、或经纬度为 0 |
| `SYS`           | System 数据缺失或过期（>3 s）            |
| `SELF_ID`       | SelfID 缺失或过期（>22 s）               |
| `OP_ID`         | OperatorID 缺失或过期（>22 s）           |
| `OP_LOC`        | 遥控站经纬度为 0                         |
| `ID`            | 模块参数中没有任何 BasicID               |
| `bad LOC data`  | Location 字段越界                        |
| `bad SYS data`  | System 字段越界                          |
| `bad ID_1 data` | BasicID[0] 编码失败                      |

判定逻辑见 `transport.cpp:34-94`。

### 5.2 NodeStatus（341）

| 项           | 值                   |
| ------------ | -------------------- |
| Data Type ID | 341                  |
| 签名         | `0x0F0868D0C1A7C6F1` |
| 类型         | 广播，1 Hz           |

可用来检测模块是否在线，以及读取 `uptime_sec`。

### 5.3 GetNodeInfo（服务 ID 1）

| 项         | 值                   |
| ---------- | -------------------- |
| Service ID | 1                    |
| 签名       | `0xEE468A8121C46A9E` |

响应中可读到：

- `name` = `"ArduPilot RemoteIDModule"`
- `hardware_version.major/minor` = `CAN_BOARD_ID >> 8` / `CAN_BOARD_ID & 0xFF`（默认 10001 → 39/17）
- `software_version` = 固件版本号
- `unique_id` = ESP32 eFuse MAC

用于飞控上电自检、确认总线上挂的是正确设备。

### 5.4 LogMessage（16383）

| 项           | 值                   |
| ------------ | -------------------- |
| Data Type ID | 16383                |
| 签名         | `0xD654A48E0C049D75` |

模块在参数被锁、字符串参数过短等情况下会广播调试日志，建议飞控转发到日志系统。

### 5.5 其他服务

| 服务                              | ID  | 说明                                      |
| --------------------------------- | --- | ----------------------------------------- |
| `uavcan.protocol.RestartNode`     | 5   | 重启模块                                  |
| `uavcan.protocol.param.GetSet`    | 11  | 读写模块参数（隐藏参数会被拒绝）          |
| `dronecan.remoteid.SecureCommand` | 64  | 带 Ed25519 签名的安全配置，一般飞控不需要 |

`Param.GetSet` 可访问的参数见附录 B。设置 `LOCK_LEVEL > 0` 后所有写操作会被拒绝。

---

## 6. 时序与发送频率

### 6.1 上电流程

```
飞控上电                                 RID 模块上电
   │                                          │
   │                                          ├─ 若 CAN_NODE=0：发 DNA 请求
   │◄──────── dynamic_node_id.Allocation ─────┤
   ├──────── Allocation 响应 ────────────────►│
   │                                          ├─ 获得节点 ID
   │                                          │
   ├════ 20030~20034 周期广播 ═══════════════►│
   │◄════ 20035 ArmStatus（1 Hz）═════════════┤
   │◄════ 341 NodeStatus（1 Hz）══════════════┤
```

- 飞控应在 CAN 初始化完成后**立即开始**周期发送，不要等待模块
- 模块在收到第一份有效数据前，ArmStatus 会报缺失项
- 模块的预解锁判定有 3 s / 22 s 的宽限期，但建议一开始就持续发送

### 6.2 推荐频率

| 消息       | 推荐频率       | 理由                                          |
| ---------- | -------------- | --------------------------------------------- |
| Location   | **5–10 Hz**    | 位置变化快，且模块按 `timestamp` 刷新存活时间 |
| System     | 1 Hz           | 遥控站位置变化慢，但超时只有 3 s              |
| BasicID    | 1 Hz           | 内容基本不变                                  |
| SelfID     | 1 Hz 或 0.1 Hz | 超时 22 s，0.1 Hz 也够，但 1 Hz 更省心        |
| OperatorID | 1 Hz 或 0.1 Hz | 同上                                          |

1 Mbps 总线上，Location 一帧约 6 个 CAN 帧、System 约 5 帧，10 Hz Location 的带宽占用不到 10 kbps，可以放心发。

### 6.3 timestamp 必须递增（最容易踩的坑）

模块判断数据是否新鲜的方式是**看 timestamp 变没变**，而不是看有没有收到报文：

```c
// DroneCAN.cpp:577-581
if (last_location_timestamp != pkt.timestamp) {
    last_location_ms = millis();
    last_location_timestamp = pkt.timestamp;
}
```

由此推出两条硬性要求：

1. **Location.timestamp 和 System.timestamp 必须在 3 秒内至少变化一次。**
   - Location 用"整点后秒数"：`unix_seconds % 3600`，建议保留 0.1 s 小数。
   - System 用 Unix 秒。
   - 如果没有 GPS 时间，也必须用单调递增的计数器模拟，**不能发常量**。

2. **System.timestamp 不能为 0。** 为 0 时模块不会生成 System 数据（`RemoteIDModule.ino:350`），即使报文收到了也没用。

### 6.4 模块侧超时汇总

| 数据       | 超时阈值   | 判定位置           |
| ---------- | ---------- | ------------------ |
| Location   | 3 s        | `transport.cpp:50` |
| System     | 3 s        | `transport.cpp:67` |
| SelfID     | 22 s       | `transport.cpp:59` |
| OperatorID | 22 s       | `transport.cpp:63` |
| BasicID    | 不检查超时 | 参数或实时数据     |

---

## 7. 模块侧的数据校验

### 7.1 数值范围检查

模块在组包前会调用 OpenDroneID 的编码函数，越界会导致 `check_parse()` 失败，进而在 ArmStatus 中报 `bad LOC data` / `bad SYS data`。务必遵守第 4 节的取值范围。

特别注意：

- 经纬度单位是 `度 × 1e7`，不是浮点度数
- `direction` 是**百分之一度**（cdeg），不是度
- 水平/垂直速度单位是 **cm/s**，不是 m/s
- 高度单位是 **米**，浮点

### 7.2 BasicID 的持久化

| `OPTIONS` bit1   | 行为                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| 置位（默认值 2） | 使用飞控实时数据，不写 NVS                                                        |
| 清零             | 首次收到有效 BasicID 后写入 `UAS_TYPE` / `UAS_ID_TYPE` / `UAS_ID`，之后可脱机广播 |

如果飞控希望"配置一次、永久生效"，可以清除 bit1；如果希望每次上电由飞控下发，保持默认即可。

### 7.3 ArmStatus 判定表

| 检查项            | 通过条件                           |
| ----------------- | ---------------------------------- |
| Location 新鲜度   | 3 s 内收到且 timestamp 变化过      |
| Location 有效性   | 纬度或经度至少一个非 0             |
| System 新鲜度     | 3 s 内收到且 timestamp 变化过      |
| System 有效性     | 遥控站经纬度至少一个非 0           |
| SelfID 新鲜度     | 22 s 内收到过                      |
| OperatorID 新鲜度 | 22 s 内收到过                      |
| BasicID           | 参数中已配置，或实时数据已置 Valid |

---

## 8. 参考实现

> 以下代码中的 `can_frame_t` / `can_driver_send()` / `can_driver_receive()` / `CAN_EFF_FLAG` / `micros64()` 代表飞控自身的 CAN 驱动接口，移植时替换成对应平台的实现即可。

### 8.1 DSDL 定义

把以下 5 个文件加入飞控的 DSDL 目录，用 `dronecan_dsdlc` 生成头文件。也可以直接复制本仓库 `libraries/DroneCAN_generated/dronecan.remoteid.*`。

**`dronecan/remoteid/BasicID.uavcan`**

```
uint8[<=20] id_or_mac
uint8 id_type
uint8 ua_type
uint8[<=20] uas_id
```

**`dronecan/remoteid/Location.uavcan`**

```
uint8[<=20] id_or_mac
uint8 status
uint16 direction
uint16 speed_horizontal
int16 speed_vertical
int32 latitude
int32 longitude
float32 altitude_barometric
float32 altitude_geodetic
uint8 height_reference
float32 height
uint8 horizontal_accuracy
uint8 vertical_accuracy
uint8 barometer_accuracy
uint8 speed_accuracy
float32 timestamp
uint8 timestamp_accuracy
```

**`dronecan/remoteid/SelfID.uavcan`**

```
uint8[<=20] id_or_mac
uint8 description_type
uint8[<=23] description
```

**`dronecan/remoteid/System.uavcan`**

```
uint8[<=20] id_or_mac
uint8 operator_location_type
uint8 classification_type
int32 operator_latitude
int32 operator_longitude
uint16 area_count
uint16 area_radius
float32 area_ceiling
float32 area_floor
uint8 category_eu
uint8 class_eu
float32 operator_altitude_geo
uint32 timestamp
```

**`dronecan/remoteid/OperatorID.uavcan`**

```
uint8[<=20] id_or_mac
uint8 operator_id_type
uint8[<=20] operator_id
```

**`dronecan/remoteid/ArmStatus.uavcan`**（用于接收）

```
uint8 status
uint8[<=50] error
```

### 8.2 初始化与收发泵

```c
#include <canard.h>
#include <dronecan.remoteid.BasicID.h>
#include <dronecan.remoteid.Location.h>
#include <dronecan.remoteid.SelfID.h>
#include <dronecan.remoteid.System.h>
#include <dronecan.remoteid.OperatorID.h>
#include <dronecan.remoteid.ArmStatus.h>

static CanardInstance canard;
static uint8_t canard_pool[4096];

/* transfer ID 计数器，每种消息一个，必须持久保存 */
static uint8_t tid_basic, tid_location, tid_self, tid_system, tid_operator;

/* ---- 接收回调 ---- */
static void on_transfer_received(CanardInstance *ins, CanardRxTransfer *transfer)
{
    if (transfer->data_type_id == DRONECAN_REMOTEID_ARMSTATUS_ID &&
        transfer->transfer_type == CanardTransferTypeBroadcast) {
        struct dronecan_remoteid_ArmStatus msg;
        if (!dronecan_remoteid_ArmStatus_decode(transfer, &msg)) {
            rid_arm_ok = (msg.status ==
                          DRONECAN_REMOTEID_ARMSTATUS_ODID_ARM_STATUS_GOOD_TO_ARM);
            /* msg.error.data / msg.error.len 为失败原因，可写入日志 */
        }
    }
}

static bool should_accept_transfer(const CanardInstance *ins,
                                   uint64_t *out_signature,
                                   uint16_t data_type_id,
                                   CanardTransferType transfer_type,
                                   uint8_t source_node_id)
{
    switch (data_type_id) {
    case DRONECAN_REMOTEID_ARMSTATUS_ID:
        *out_signature = DRONECAN_REMOTEID_ARMSTATUS_SIGNATURE;
        return true;
    default:
        return false;
    }
}

void rid_can_init(uint8_t fc_node_id)
{
    canardInit(&canard, canard_pool, sizeof(canard_pool),
               on_transfer_received, should_accept_transfer, NULL);
    canardSetLocalNodeID(&canard, fc_node_id);
}
```

```c
/* ---- 发送泵：每 1 ms 调用一次 ---- */
void rid_can_tx_pump(void)
{
    const CanardCANFrame *f;
    while ((f = canardPeekTxQueue(&canard)) != NULL) {
        can_frame_t cf = {0};
        cf.id  = f->id | CAN_EFF_FLAG;      /* 29-bit 扩展帧 */
        cf.dlc = f->data_len;
        memcpy(cf.data, f->data, f->data_len);
        if (!can_driver_send(&cf)) {
            break;                           /* 发送失败，下轮重试 */
        }
        canardPopTxQueue(&canard);
    }
}

/* ---- 接收泵：由 CAN RX 中断/轮询驱动 ---- */
void rid_can_rx_pump(void)
{
    can_frame_t cf;
    while (can_driver_receive(&cf)) {
        CanardCANFrame f = {0};
        f.id       = cf.id & CAN_EFF_MASK;
        f.data_len = cf.dlc;
        memcpy(f.data, cf.data, cf.dlc);
        canardHandleRxFrame(&canard, &f, micros64());
    }
}
```

### 8.3 各消息发送函数

```c
void rid_send_basic_id(const char *uas_id, uint8_t id_type, uint8_t ua_type)
{
    struct dronecan_remoteid_BasicID msg = {0};
    msg.id_type = id_type;
    msg.ua_type = ua_type;
    msg.uas_id.len = strnlen(uas_id, 20);
    memcpy(msg.uas_id.data, uas_id, msg.uas_id.len);

    uint8_t payload[DRONECAN_REMOTEID_BASICID_MAX_SIZE];
    uint32_t len = dronecan_remoteid_BasicID_encode(&msg, payload);

    canardBroadcast(&canard,
                    DRONECAN_REMOTEID_BASICID_SIGNATURE,
                    DRONECAN_REMOTEID_BASICID_ID,
                    &tid_basic,
                    CANARD_TRANSFER_PRIORITY_MEDIUM,   /* 必须 >= 16 */
                    payload, len);
}

void rid_send_location(const struct dronecan_remoteid_Location *loc)
{
    uint8_t payload[DRONECAN_REMOTEID_LOCATION_MAX_SIZE];
    uint32_t len = dronecan_remoteid_Location_encode(
                       (struct dronecan_remoteid_Location *)loc, payload);

    canardBroadcast(&canard,
                    DRONECAN_REMOTEID_LOCATION_SIGNATURE,
                    DRONECAN_REMOTEID_LOCATION_ID,
                    &tid_location,
                    CANARD_TRANSFER_PRIORITY_MEDIUM,
                    payload, len);
}

void rid_send_system(const struct dronecan_remoteid_System *sys)
{
    uint8_t payload[DRONECAN_REMOTEID_SYSTEM_MAX_SIZE];
    uint32_t len = dronecan_remoteid_System_encode(
                       (struct dronecan_remoteid_System *)sys, payload);

    canardBroadcast(&canard,
                    DRONECAN_REMOTEID_SYSTEM_SIGNATURE,
                    DRONECAN_REMOTEID_SYSTEM_ID,
                    &tid_system,
                    CANARD_TRANSFER_PRIORITY_MEDIUM,
                    payload, len);
}

void rid_send_self_id(uint8_t desc_type, const char *text)
{
    struct dronecan_remoteid_SelfID msg = {0};
    msg.description_type = desc_type;
    msg.description.len = strnlen(text, 23);
    memcpy(msg.description.data, text, msg.description.len);

    uint8_t payload[DRONECAN_REMOTEID_SELFID_MAX_SIZE];
    uint32_t len = dronecan_remoteid_SelfID_encode(&msg, payload);

    canardBroadcast(&canard,
                    DRONECAN_REMOTEID_SELFID_SIGNATURE,
                    DRONECAN_REMOTEID_SELFID_ID,
                    &tid_self,
                    CANARD_TRANSFER_PRIORITY_MEDIUM,
                    payload, len);
}

void rid_send_operator_id(uint8_t id_type, const char *operator_id)
{
    struct dronecan_remoteid_OperatorID msg = {0};
    msg.operator_id_type = id_type;
    msg.operator_id.len = strnlen(operator_id, 20);
    memcpy(msg.operator_id.data, operator_id, msg.operator_id.len);

    uint8_t payload[DRONECAN_REMOTEID_OPERATORID_MAX_SIZE];
    uint32_t len = dronecan_remoteid_OperatorID_encode(&msg, payload);

    canardBroadcast(&canard,
                    DRONECAN_REMOTEID_OPERATORID_SIGNATURE,
                    DRONECAN_REMOTEID_OPERATORID_ID,
                    &tid_operator,
                    CANARD_TRANSFER_PRIORITY_MEDIUM,
                    payload, len);
}
```

### 8.4 周期调度示例

```c
void rid_update_100hz(void)          /* 100 Hz 调用 */
{
    static uint8_t div10, div100;

    /* Location: 10 Hz */
    struct dronecan_remoteid_Location loc = {0};
    loc.id_or_mac.len      = 0;
    loc.status             = airborne ? 2 : 1;
    loc.direction          = (uint16_t)(heading_cdeg);        /* cdeg */
    loc.speed_horizontal   = (uint16_t)(ground_speed_cms);    /* cm/s */
    loc.speed_vertical     = (int16_t)(climb_rate_cms);       /* cm/s */
    loc.latitude           = lat_deg_e7;
    loc.longitude          = lon_deg_e7;
    loc.altitude_barometric = alt_baro_m;
    loc.altitude_geodetic   = alt_geo_m;
    loc.height_reference    = 0;
    loc.height              = height_m;
    loc.horizontal_accuracy = nacp;
    loc.vertical_accuracy   = gva;
    loc.barometer_accuracy  = gva;
    loc.speed_accuracy      = nacv;
    loc.timestamp           = (float)(unix_sec % 3600) + (unix_ms % 1000) / 1000.0f;
    loc.timestamp_accuracy  = 1;                              /* 0.1 s */
    rid_send_location(&loc);

    if (++div10 >= 10) {                  /* 1 Hz */
        div10 = 0;
        rid_send_system(&sys);
        rid_send_basic_id(uas_id, id_type, ua_type);
        rid_send_self_id(0, self_id_text);
        rid_send_operator_id(0, operator_id);
    }

    rid_can_tx_pump();
}
```

> 注意 `Location` 里的 `loc` 每次重新构造，`timestamp` 必须随真实时间变化。

### 8.5 使用 ArmStatus 做预解锁检查

```c
bool rid_prearm_check(char *reason, size_t reason_len)
{
    if (rid_arm_ok) {
        return true;
    }
    snprintf(reason, reason_len, "RID: %s", rid_error_text);
    return false;
}
```

建议策略：

- **上电前 10 秒**：忽略 RID 状态，给模块留出初始化和数据积累时间
- **10 秒后**：`status != 0` 时禁止解锁
- 把 `error` 文本透传到地面站，方便定位是缺哪类数据

---

## 9. 调试与排障

### 9.1 上电检查清单

1. 总线速率是 1 Mbps 吗？
2. 终端电阻 120 Ω 装了吗？
3. 模块 `CAN_NODE` 是否为 0？如果飞控没有 DNA 分配器，改成固定值。
4. 发送优先级是否 ≥ 16（MEDIUM/LOW/LOWEST）？
5. DSDL 签名是否与第 4.1 节一致？
6. `System.timestamp` 是否非 0 且递增？
7. `Location.timestamp` 是否在变化？
8. 经纬度是否至少有一个非 0？
9. 5 类消息是否都在发？

### 9.2 常见问题

| 现象                               | 可能原因                               | 排查方法                                              |
| ---------------------------------- | -------------------------------------- | ----------------------------------------------------- |
| 总线上完全看不到模块的帧           | 模块没拿到节点 ID                      | 用示波器/CAN 分析仪看是否有 DNA 请求；检查 `CAN_NODE` |
| 模块能看到帧但不广播               | 模块没拿到节点 ID 或没收到有效数据     | 读模块 `NodeStatus.uptime_sec` 判断是否启动           |
| ArmStatus 一直 `LOC`               | Location 没发、超时、或 timestamp 不变 | 检查发送频率与 timestamp                              |
| ArmStatus 一直 `SYS`               | System 没发或 `timestamp == 0`         | 检查 System 报文                                      |
| ArmStatus 一直 `SELF_ID` / `OP_ID` | 这两类消息没发                         | 补发即可，超时 22 s                                   |
| ArmStatus 报 `bad LOC data`        | Location 字段越界                      | 对照 4.3 节范围                                       |
| ArmStatus 报 `bad SYS data`        | System 字段越界                        | 对照 4.4 节范围                                       |
| 模块收到了帧但没反应               | 优先级 < 16，被硬件过滤                | 改成 MEDIUM                                           |
| 有帧但解码失败                     | DSDL 签名不匹配                        | 核对签名表                                            |
| 数据偶尔错乱                       | 多帧 CRC/分片错误                      | 用 libcanard，别自己拼帧                              |

### 9.3 抓包参考

以下是实测的一个 BasicID 传输（飞控节点 ID = 42，优先级 16）：

```
ID=0x104E3E2A  [21 71 00 08 11 89 A9 80]
ID=0x104E3E2A  [C9 B2 31 99 CA A2 2A 20]
ID=0x104E3E2A  [9A A1 81 81 81 81 81 00]
ID=0x104E3E2A  [81 81 81 80 60]
```

- `0x104E3E2A` = 优先级 16 + Data Type ID 20030 + 源节点 42
- 第一帧前两字节 `21 71` 是 CRC-16
- tail byte 依次为 `0x80`（SOT）、`0x20`、`0x00`、`0x60`（EOT）

如果抓到的帧没有这些特征，说明发送侧没有正确走 DroneCAN 分片。

### 9.4 读取模块参数

用 `uavcan.protocol.param.GetSet`（服务 ID 11）可以读取/修改附录 B 中的参数。注意：

- `PARAM_FLAG_HIDDEN` 的参数（如 `CAN_NODE`、`UAS_ID`）通过 DroneCAN **不可见**
- `LOCK_LEVEL > 0` 时所有写操作被拒绝
- `CHAR20` 类参数设置了 `min_len` 时，长度不足会被拒绝

---

## 10. 附录

### A. 完整报文示例

数据：UAS_ID = `1596F39TEST0000000001`，位置 39.905/116.400，高度 50 m，速度 5.5 m/s，时间戳 3600.0。

**BasicID（20030），载荷 23 字节**

```
00 08 11 89 A9 C9 B2 31 99 CA A2 2A 9A A1 81 81
81 81 81 81 81 81 80
```

**Location（20031），载荷 38 字节**

```
00 15 E1 A1 30 14 E7 F8 80 2E 48 B8 01 DB 0A 28
00 07 82 10 00 07 D2 10 00 00 02 42 10 60 28 28
20 00 03 0A 28 08
```

**SelfID（20032），载荷 14 字节**

```
00 02 72 2A C2 A2 82 4A 62 7A A1 02 92 48
```

**System（20033），载荷 33 字节**

```
00 00 08 06 F6 40 BF 80 9B 0A 28 08 00 00 00 00
07 82 10 00 00 00 00 00 00 00 01 A2 16 01 64 DB
40
```

**OperatorID（20034），载荷 10 字节**

```
00 01 89 91 99 A1 A9 B1 B9 C0
```

**ArmStatus（20035），载荷 1 字节（无错误文本）**

```
00
```

对应的完整 CAN 帧（节点 42）：

| 消息       | CAN 帧                                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BasicID    | `21 71 00 08 11 89 A9 80` / `C9 B2 31 99 CA A2 2A 20` / `9A A1 81 81 81 81 81 00` / `81 81 81 80 60`                                                            |
| Location   | `96 85 00 15 E1 A1 30 80` / `14 E7 F8 80 2E 48 B8 20` / `01 DB 0A 28 00 07 82 00` / `10 00 07 D2 10 00 00 20` / `02 42 10 60 28 28 20 00` / `00 03 0A 28 08 60` |
| SelfID     | `94 5B 00 02 72 2A C2 80` / `A2 82 4A 62 7A A1 02 20` / `92 48 40`                                                                                              |
| System     | `27 C9 00 00 08 06 F6 80` / `40 BF 80 9B 0A 28 08 20` / `00 00 00 00 07 82 10 00` / `00 00 00 00 00 00 00 20` / `01 A2 16 01 64 DB 40 40`                       |
| OperatorID | `82 1E 00 01 89 91 99 80` / `A1 A9 B1 B9 C0 60`                                                                                                                 |
| ArmStatus  | `00 C0`                                                                                                                                                         |

### B. 模块参数（DroneCAN 可见部分）

| 参数               | 类型   | 默认值                 | 范围        | 说明                               |
| ------------------ | ------ | ---------------------- | ----------- | ---------------------------------- |
| `BAUDRATE`         | UINT32 | 115200                 | 9600–921600 | 串口 MAVLink 波特率                |
| `GB_BLE_RATE`      | FLOAT  | 1                      | 0–5         | 国标 BLE 广播频率 Hz               |
| `GB_POWER`         | FLOAT  | 18                     | −27–18      | 国标发射功率 dBm                   |
| `GB_UNIQUE_ID`     | CHAR20 | `NEXTT6Y4A2C4E6G8K0M2` | —           | GB 唯一产品识别码                  |
| `GB_REALNAME`      | CHAR8  | `12345678`             | —           | GB 实名登记标志                    |
| `GB_OP_CATEGORY`   | UINT8  | 1                      | 0–3         | 运行类别                           |
| `GB_UA_CLASS`      | UINT8  | 0                      | 0–5         | 无人机分类                         |
| `GB_WIFI_BCN_RATE` | FLOAT  | 1                      | 0–5         | GB WiFi Beacon 频率 Hz             |
| `GB_WIFI_NAN_RATE` | FLOAT  | 1                      | 0–5         | GB WiFi NAN 频率 Hz                |
| `WEBSERVER_EN`     | UINT8  | 1                      | 0–1         | Web 服务开关                       |
| `UDP_FWD_EN`       | UINT8  | 1                      | 0–1         | MAVLink UDP 转发                   |
| `MAVLINK_SYSID`    | UINT8  | 0                      | 0–254       | 串口 MAVLink 系统 ID               |
| `SIM_ON`           | UINT8  | 1                      | 0–1         | RID 信号模拟开关                   |
| `WIFI_SSID`        | CHAR20 | `NP-RID-Sender`        | —           | AP SSID                            |
| `WIFI_PASSWORD`    | CHAR20 | `nextpilot`            | —           | AP 密码                            |
| `WIFI_CHANNEL`     | UINT8  | 6                      | 1–13        | AP 信道                            |
| `BCAST_POWERUP`    | UINT8  | 1                      | 0–1         | 上电即广播                         |
| `OPTIONS`          | UINT8  | 2                      | 0–254       | bit0 强制解锁，bit1 不保存 BasicID |
| `GB_UTC_TIME`      | CHAR20 | `""`                   | —           | 一次性 UTC 时间设置                |
| `GB_UTC8_TIME`     | CHAR20 | `""`                   | —           | 一次性北京时间设置                 |
| `GB_WIFI_MODE`     | UINT8  | 1                      | 0–1         | 0 注入原始帧，1 挂 AP Beacon       |

> `CAN_NODE`、`UAS_ID`、`UAS_TYPE`、`UAS_ID_TYPE` 等带 `PARAM_FLAG_HIDDEN` 的参数通过 DroneCAN 参数服务**不可访问**，只能通过 Web 或串口控制台配置。

### C. 关键代码位置索引

| 功能                              | 文件                                        |
| --------------------------------- | ------------------------------------------- |
| DroneCAN 初始化、过滤器、消息分发 | `RemoteIDModule/DroneCAN.cpp`               |
| CAN 驱动、位时序                  | `RemoteIDModule/CANDriver.cpp`              |
| 数据组装、BasicID/OperatorID 策略 | `RemoteIDModule/RemoteIDModule.ino:216-390` |
| 预解锁判定                        | `RemoteIDModule/transport.cpp:34-94`        |
| DSDL 生成代码                     | `libraries/DroneCAN_generated/`             |
| libcanard                         | `libraries/libcanard/`                      |

### D. 参考

- ASTM F3411-22a，Remote ID and Tracking
- DroneCAN 协议规范：<https://dronecan.github.io/>
- libcanard：<https://github.com/dronecan/libcanard>
- ArduPilot DroneCAN 驱动：`AP_DroneCAN` / `AP_DroneCAN_RID`
