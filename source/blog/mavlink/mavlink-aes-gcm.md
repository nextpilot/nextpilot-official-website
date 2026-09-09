---
title: 给 MAVLink 加密：AES-128-GCM 接入 PX4 + QGC 全记录
shortTitle: MAVLink AES-GCM 链路加密
description: 在 MAVLink v2 上自实现一层 AES-128-GCM 认证加密：只加密 payload、帧尾追加 nonce 与 tag，附 pymavlink 生成器、PX4 与 QGroundControl 的完整接入步骤和踩坑记录。
summary: 在 MAVLink v2 上自实现一层 AES-128-GCM 认证加密：只加密 payload，加密所需的nonce 和 tag 追加在帧尾（signature 之后），CRC 不覆盖它们，一共多 28 字节，附 pymavlink 生成器、PX4 与 QGroundControl 的完整接入步骤和踩坑记录。
date: 2026-09-08
category: MAVLink
tags: [MAVLink, AES-GCM, 链路加密, PX4, QGroundControl]
cover: /assets/images/blog/mavlink-aes-gcm.jpg
---

# 给 MAVLink 加密：AES-128-GCM 接入 PX4 + QGC 全记录

先交代背景，飞控和地面站之间走 MAVLink，说白了就是一条明文串口/数传，谁拿到链路都能把飞行数据看个底朝天。MAVLink v2 官方给的是 signing（签名），只能防篡改、不加密内容。我这边要的是「截到包也看不懂」，所以干脆自己给 MAVLink 加了一层 AES-128-GCM 认证加密。

方案一句话说清楚：**只加密 payload**，header 和 CRC 保持明文，CRC 算法跟原版完全一样；帧尾追加 12 字节 nonce + 16 字节 tag，一共多 28 字节。整个能力用 `MAVLINK_USE_AES_ENCRYPTION` 宏控制，不定义这个宏，编译产物和原生 MAVLink 一模一样。

改好的东西我都整理到一个仓库里（[gitee](https://gitee.com/nextpilot/nextpilot-sercue-mavlink.git) | [github](https://github.com/nextpilot/nextpilot-sercue-mavlink.git)）了：

```bash
git clone https://gitee.com/nextpilot/nextpilot-sercue-mavlink.git
```

目录长这样：

```
├── MAVLINK_AES_GCM.md          # 算法原理、帧结构、打包/解析流程（细节都在里面）
├── c_library_v2-aes-gcm/       # 已经修改好的 MAVLink C 库（含 AES 改动）
├── pymavlink/                  # MAVLink代码生成器的改动
├── PX4-Autopilot-1.17.0/       # PX4 需要改动源码
└── qgroundcontrol-4.4.5/       # QGC 需要改动源码
```

## 1. 生成环境

本次改动基于下面这套版本：

| 组件 | 版本 | 说明 |
| --- | --- | --- |
| 飞控固件 | PX4-Autopilot v1.17.0 | 改动在 `src/modules/mavlink/` |
| 地面站 | QGroundControl v4.4.5 | 改动在 `src/comm/` |
| 代码生成器 | pymavlink | 随 PX4 子模块，改的是 `mavgen_c.py` |
| MAVLink 协议 | v2.0 | 加密只对 v2 生效，v1 不支持 |
| Qt（编译 QGC） | 5.15.2 | - |
| 系统（编译 PX4） | Ubuntu 22.04 | PX4 官方工具链 |

## 2. 加密方式

下面一步步说每个目录里改了什么、为什么这么改。

### 2.1 为什么选 AES-GCM

市面上能给 MAVLink 用的方案大致这几个：

| 方案 | 机密性 | 完整性 | 帧开销 | 说明 |
| --- | --- | --- | --- | --- |
| 原始 CRC | ✗ | CRC-16 只能检错 | 0 | 现状，纯明文 |
| MAVLink 签名 | ✗ | SHA-256 签名 | 13 字节 | 只防篡改不加密 |
| **AES-GCM** | ✓ | GMAC 强认证 | 28 字节 | 加密 + 认证一次搞定 |
| ChaCha20-Poly1305 | ✓ | Poly1305 | 28 字节 | 也不错，但 MCU 上没有硬件加速 |

选 AES-GCM 的理由很简单：一次 GCM 操作就把加密和认证都干了，不用额外再签名；STM32、ESP32 这些主流的 MCU 都有 AES 硬件引擎；纯软件实现也不大（一个 S-box + 176 字节轮密钥），嵌入式完全扛得住。

### 2.2 加密之后帧长啥样

只在 payload 上做文章，别的字段原样保留。nonce 和 tag 追加在帧尾（signature 之后），CRC 不覆盖它们：

```
┌───────────┬──────────────┬─────┬──────────┬──────────────┬─────────────┐
│ header    │ payload      │ CRC │ signature│ nonce        │ auth_tag    │
│ (10B)     │ (N bytes)    │(2B) │(opt,13B) │ (12B,明文)   │ (16B,明文)  │
└───────────┴──────────────┴─────┴──────────┴──────────────┴─────────────┘
          ← 原始 MAVLink v2 帧 →              ← 加密追加部分 →
```

要点：

- `len` 还是 payload 原始长度，不含 nonce/tag。
- CRC 跟原版一致：`CRC(header[1..9] + payload + crc_extra)`，nonce/tag 不参与。
- header 里的 `incompat_flags` 置 `0x02`（`MAVLINK_IFLAG_ENCRYPTED`），告诉对端「这帧是加密的」。
- 只有 v2 支持加密，v1 没有 `incompat_flags`，没法声明加密帧。

接收端的状态机也简单：读完 CRC 后，如果 `ENCRYPTED` 位是置位的，就接着读 12 字节 nonce → 16 字节 tag → 解密校验。非加密帧走老路径，行为一点没变。

## 3. 如何改动

改的东西其实分三层：

1. **pymavlink 生成器**：让 `mavgen` 生成 C 库时自动带上 AES 头文件。
2. **PX4 / QGC**：把 C 库接进去，加载密钥、绑定通道、打开宏。

顺序上，先有生成器，才有 C 库；有了 C 库，PX4 和 QGC 才能用。但仓库里我已经把生成好的 C 库放好了（`c_library_v2-aes-gcm/`），所以不想动生成器的话，直接拿现成的库去改 PX4/QGC 也行，第一层可以跳过。

### 3.1 改 pymavlink 生成器

pymavlink 的 C 代码生成器在 `generator/` 下，固定头（`mavlink_types.h`、`mavlink_helpers.h` 这类）存在 `generator/C/include_v2.0/`。

要动的就两处：

**① 拷贝 3 个文件到 `generator/C/include_v2.0/`**（覆盖同名文件）：

```
mavlink_helpers.h      ← 覆盖
mavlink_types.h        ← 覆盖
mavlink_aes_gcm.h      ← 新增
```

**② 改 `generator/mavgen_c.py`**，找到 `copy_fixed_headers()`（大概 568 行），在 `"2.0"` 的列表末尾加上 `'mavlink_aes_gcm.h'`：

```python
def copy_fixed_headers(directory, xml):
    '''copy the fixed protocol headers to the target directory'''
    import shutil, filecmp
    hlist = {
        "0.9": [ 'protocol.h', 'mavlink_helpers.h', 'mavlink_types.h', 'checksum.h' ],
        "1.0": [ 'protocol.h', 'mavlink_helpers.h', 'mavlink_types.h', 'checksum.h', 'mavlink_conversions.h' ],
        "2.0": [ 'protocol.h', 'mavlink_helpers.h', 'mavlink_types.h', 'checksum.h', 'mavlink_conversions.h',
                 'mavlink_get_info.h', 'mavlink_sha256.h', 'mavlink_aes_gcm.h' ]   # ← 加这里
        }
    ...
```

改完重新生成一次，就能得到带 AES 改动的 C 库，结构和仓库里的 `c_library_v2-aes-gcm/` 一模一样：

```bash
python -m pymavlink.tools.mavgen --lang=C --wire-protocol=2.0 \
    --output=c_library_v2-aes-gcm message_definitions/v1.0/all.xml
```

生成的库，固定头在根目录，`common/`、`minimal/`、`standard/` 这些方言是子目录，靠 `../xxx.h` 引用固定头。

### 3.2 MAVLink C 库的三个文件

这层是重头戏，后面 PX4/QGC 的改动都只是调这里的接口。三个文件：

#### 3.2.1 `mavlink_aes_gcm.h`（新增）

完整的 AES-128-GCM 软件实现，重点看这几个对外符号：

```c
#define MAVLINK_AES_KEY_LEN    16   // 密钥 16 字节
#define MAVLINK_AES_NONCE_LEN  12   // nonce 12 字节
#define MAVLINK_AES_TAG_LEN    16   // tag 16 字节

typedef struct __mavlink_aes_gcm_state {
    uint8_t  key[16];                      // 预共享密钥
    uint8_t  flags;                        // MAVLINK_AES_FLAG_ENCRYPT_OUTGOING 等
    mavlink_aes_gcm_random_callback random_callback; // 可选硬件 RNG，NULL 用内置 xorshift
    uint32_t prng_state;                   // 内置 PRNG 种子
} mavlink_aes_gcm_state_t;

#define MAVLINK_AES_FLAG_ENCRYPT_OUTGOING 0x01   // 启用对外发送加密

void mavlink_aes_gcm_encrypt(mavlink_message_t *msg, mavlink_status_t *status);
bool mavlink_aes_gcm_decrypt(mavlink_message_t *msg, mavlink_status_t *status);
```

#### 3.2.2 `mavlink_types.h`

| 改动 | 说明 |
| --- | --- |
| `mavlink_message_t` 加 `aes_nonce[12]`、`aes_tag[16]` | 每个包自己的 nonce 和 tag |
| `mavlink_status_t` 加 `aes_gcm` 指针 | 指向本通道的 GCM 状态 |
| 加 `MAVLINK_IFLAG_ENCRYPTED (0x02)` | 加密帧标记位 |
| `MAVLINK_IFLAG_MASK` → `0x03` | SIGNED + ENCRYPTED |
| `MAVLINK_MAX_PACKET_LEN` 加密时 +28 | 280 → 308 |
| 加解析状态 `GOT_AES_NONCE`、`GOT_AES_TAG` | CRC 之后读 nonce/tag |

#### 3.2.3 `mavlink_helpers.h`

- **发**：`mavlink_finalize_message_buffer()` / `_mav_finalize_message_chan_send()` / `mavlink_msg_to_send_buffer()` 里，当通道配了 `aes_gcm` 且带 `ENCRYPT_OUTGOING` 标志：payload 原地加密 → 置 `ENCRYPTED` 位 → 帧尾序列化 nonce+tag。
- **收**：状态机在 CRC 之后加两个状态 `GOT_AES_NONCE`（读 12 字节）→ `GOT_AES_TAG`（读 16 字节），读完调 `mavlink_aes_gcm_decrypt()` 校验 tag 并解密。

所有改动都包在 `#ifdef MAVLINK_USE_AES_ENCRYPTION ... #endif` 里，不定义宏就是原生行为。

### 3.3 把 C 库接进 PX4

PX4 用的是 `src/modules/mavlink/` 下的 mavlink 头文件。先把 3 个改动过的固定头覆盖进去（找到原本 `mavlink_types.h` 在哪个目录，一般就在 `src/modules/mavlink/mavlink/pymavlink/generator/C/include_v2.0`）：

```bash
find src/modules/mavlink/pymavlink/generator/C/include_v2.0 -name mavlink_types.h   # 先定位

cp c_library_v2-aes-gcm/mavlink_aes_gcm.h  src/modules/mavlink/mavlink/pymavlink/generator/C/include_v2.0
cp c_library_v2-aes-gcm/mavlink_types.h     src/modules/mavlink/mavlink/pymavlink/generator/C/include_v2.0
cp c_library_v2-aes-gcm/mavlink_helpers.h   src/modules/mavlink/mavlink/pymavlink/generator/C/include_v2.0
```

然后改 3 个源文件。

#### 3.3.1 `mavlink_main.h`

在类里加 AES 相关的成员和接口，用宏包起来：

```cpp
#ifdef MAVLINK_USE_AES_ENCRYPTION
public:
 mavlink_aes_gcm_state_t* get_aes_state(void) { return &_aes_state; }
private:
 void init_aes_encryption(void);              ///< 初始化 AES 加密
 mavlink_aes_gcm_state_t _aes_state{};        ///< AES-GCM 加密状态
 uint8_t _aes_key[MAVLINK_AES_KEY_LEN];       ///< AES-128 预共享密钥
#endif
```

#### 3.3.2 `mavlink_main.cpp`

共修改两处。

**① 构造函数里，`_receiver(*this)` 之后加一行初始化**：

```cpp
Mavlink::Mavlink() :
 ModuleParams(nullptr),
 _receiver(*this)
{
#ifdef MAVLINK_USE_AES_ENCRYPTION
 init_aes_encryption();
#endif
}
```

**②  文件末尾加 `init_aes_encryption()` 实现**：

```cpp
#ifdef MAVLINK_USE_AES_ENCRYPTION
void Mavlink::init_aes_encryption(void)
{
 // 1. 预共享密钥（这里先硬编码，实际项目建议从参数读）
 static const uint8_t pre_shared_key[MAVLINK_AES_KEY_LEN] = {
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
  0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F
 };
 memcpy(_aes_key, pre_shared_key, MAVLINK_AES_KEY_LEN);
 memcpy(_aes_state.key, pre_shared_key, MAVLINK_AES_KEY_LEN);

 // 2. 启用发送加密（接收端自动解密）
 _aes_state.flags = MAVLINK_AES_FLAG_ENCRYPT_OUTGOING;

 // 3. PRNG 种子（用内置 xorshift；有硬件 RNG 可以走回调）
 _aes_state.prng_state = 0x12345678;

 // 4. （可选）换成硬件随机数
 // _aes_state.random_callback = px4_random_callback;

 // 5. 绑定到 MAVLink 通道
 mavlink_status_t *status = get_status();
 if (status) {
  status->aes_gcm = &_aes_state;
  PX4_INFO("AES-GCM encryption enabled for instance %d", _instance_id);
 } else {
  PX4_ERR("Failed to initialize AES encryption");
 }
}
#endif // MAVLINK_USE_AES_ENCRYPTION
```

#### 3.3.3 `mavlink_receiver.cpp`

在消息处理循环里、真正处理消息之前，保证当前通道已经绑上 AES 状态：

```cpp
// ========== 新增：确保 AES 状态已绑定 ==========
#ifdef MAVLINK_USE_AES_ENCRYPTION
 // 如果当前通道还没绑定 AES 状态，就绑一次
 mavlink_status_t *status = mavlink_get_channel_status(_mavlink.get_channel());
 if (status && status->aes_gcm == nullptr) {
  status->aes_gcm = _mavlink.get_aes_state();
  PX4_INFO("AES-GCM bound to channel %d", _mavlink.get_channel());
 }
#endif // MAVLINK_USE_AES_ENCRYPTION

 // ... 原有消息处理 ...
```

### 3.4 把 C 库接进 QGC（地面站）

QGC 的 mavlink 头在 `libs/mavlink/include/mavlink/v2.0/`，同样覆盖 3 个文件：

```bash
cp c_library_v2-aes-gcm/mavlink_aes_gcm.h  libs/mavlink/include/mavlink/v2.0/
cp c_library_v2-aes-gcm/mavlink_types.h     libs/mavlink/include/mavlink/v2.0/
cp c_library_v2-aes-gcm/mavlink_helpers.h   libs/mavlink/include/mavlink/v2.0/
```

改 2 个源文件。

#### 3.4.1 `MAVLinkProtocol.h`

```cpp
// 新增 AES
#ifdef MAVLINK_USE_AES_ENCRYPTION
 void setupAESForLink(LinkInterface *link);
 void teardownAESForLink(LinkInterface *link);
 QMap<LinkInterface*, mavlink_aes_gcm_state_t*> _aesStates; ///< 每个链路对应的 AES 状态
#endif
```

#### 3.4.2 `MAVLinkProtocol.cc`

共修改四处。

**① 文件顶部加个随机数回调**（用 Qt 的 `QRandomGenerator`）：

```cpp
// 随机数回调
#ifdef MAVLINK_USE_AES_ENCRYPTION
static uint8_t qgc_random_callback(uint8_t *buf, uint8_t len)
{
 for (uint8_t i = 0; i < len; i++) {
  buf[i] = static_cast<uint8_t>(QRandomGenerator::global()->bounded(256));
 }
 return len;
}
#endif
```

**② 析构函数里清理残留的 AES 状态**：

```cpp
MAVLinkProtocol::~MAVLinkProtocol()
{
 storeSettings();
 _closeLogFile();

#ifdef MAVLINK_USE_AES_ENCRYPTION
 // 清理所有残留的 AES 状态
 for (auto it = _aesStates.begin(); it != _aesStates.end(); ++it) {
  LinkInterface *link = it.key();
  int channel = link->mavlinkChannel();
  mavlink_status_t *status = mavlink_get_channel_status(channel);
  if (status) {
   status->aes_gcm = nullptr;
  }
  delete it.value();
 }
 _aesStates.clear();
#endif
}
```

**③ `receiveBytes()` 里按链路惰性初始化**：

```cpp
void MAVLinkProtocol::receiveBytes(LinkInterface *link, QByteArray b)
{
 SharedLinkInterfacePtr linkPtr = _linkMgr->sharedLinkInterfacePointerForLink(link, true);
 if (!linkPtr) {
  qCDebug(MAVLinkProtocolLog) << "receiveBytes: link gone!";
  return;
 }
#ifdef MAVLINK_USE_AES_ENCRYPTION
 // 该链路还没初始化过 AES 就初始化
 if (!_aesStates.contains(link)) {
  setupAESForLink(link);
 }
#endif
 // ... 原有解析逻辑 ...
}
```

**④ 文件末尾加 `setupAESForLink()` / `teardownAESForLink()`**：

```cpp
// 新增 AES
#ifdef MAVLINK_USE_AES_ENCRYPTION
void MAVLinkProtocol::setupAESForLink(LinkInterface *link)
{
 if (!link) {
  return;
 }
 if (_aesStates.contains(link)) {
  return;   // 避免重复初始化
 }

 int channel = link->mavlinkChannel();
 if (channel < 0 || channel >= MAVLINK_COMM_NUM_BUFFERS) {
  qCDebug(MAVLinkProtocolLog) << "Invalid channel for AES init:" << channel;
  return;
 }

 mavlink_aes_gcm_state_t *aesState = new mavlink_aes_gcm_state_t;
 memset(aesState, 0, sizeof(mavlink_aes_gcm_state_t));

 // 1. 预共享密钥（跟飞控端保持一致）
 static const uint8_t pre_shared_key[MAVLINK_AES_KEY_LEN] = {
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
  0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F
 };
 memcpy(aesState->key, pre_shared_key, MAVLINK_AES_KEY_LEN);

 // 2. 启用发送加密（接收自动解密）
 aesState->flags = MAVLINK_AES_FLAG_ENCRYPT_OUTGOING;

 // 3. PRNG 种子（用外部回调时可选）
 aesState->prng_state = 0x12345678;

 // 4. 用 QGC 自己的随机数回调
 aesState->random_callback = qgc_random_callback;

 // 5. 绑定到 MAVLink 通道
 mavlink_status_t *status = mavlink_get_channel_status(channel);
 if (status) {
  status->aes_gcm = aesState;
 } else {
  qCWarning(MAVLinkProtocolLog) << "Failed to get channel status for AES init";
  delete aesState;
  return;
 }

 // 6. 存下来，并在链路断开时清理
 _aesStates[link] = aesState;
 connect(link, &LinkInterface::disconnected, this,
         [this, link]() { teardownAESForLink(link); }, Qt::UniqueConnection);

 qCDebug(MAVLinkProtocolLog) << "AES-GCM encryption enabled for channel" << channel;
}

void MAVLinkProtocol::teardownAESForLink(LinkInterface *link)
{
 if (!link || !_aesStates.contains(link)) {
  return;
 }

 int channel = link->mavlinkChannel();
 mavlink_status_t *status = mavlink_get_channel_status(channel);
 if (status) {
  status->aes_gcm = nullptr;
 }

 delete _aesStates[link];
 _aesStates.remove(link);
 disconnect(link, &LinkInterface::disconnected, this, nullptr);

 qCDebug(MAVLinkProtocolLog) << "AES-GCM state removed for channel" << channel;
}
#endif // MAVLINK_USE_AES_ENCRYPTION
```

### 3.5 打开宏（最容易漏的一步）

前面所有改动都被 `#ifdef MAVLINK_USE_AES_ENCRYPTION` 包着，**不定义这个宏，等于啥都没改**。两种方式任选：

**方式 A：改 `mavlink_types.h`（最简单）**

文件里预留了一行注释掉的宏，取消注释：

```c
//#define MAVLINK_USE_AES_ENCRYPTION //启用AES加密
   ↓
#define MAVLINK_USE_AES_ENCRYPTION   //启用AES加密
```

注意 PX4 和 QGC 各有一份 `mavlink_types.h`，两处都要改。

**方式 B：编译参数注入（生产推荐）**

- PX4（CMake）：`src/modules/mavlink/CMakeLists.txt` 里加 `add_definitions(-DMAVLINK_USE_AES_ENCRYPTION)`
- QGC（qmake）：`qgroundcontrol.pro` 里加 `DEFINES += MAVLINK_USE_AES_ENCRYPTION`

### 3.6 密钥两边要一致

AES-GCM 是对称加密，飞控和地面站必须用**完全相同的 16 字节密钥**。密钥对不上，接收端 tag 校验直接失败，payload 被清零丢弃，表现就是「地面站啥都收不到」。

要核对的就是两处：

1. PX4 `mavlink_main.cpp` 的 `init_aes_encryption()`
2. QGC `MAVLinkProtocol.cc` 的 `setupAESForLink()`

上面示例统一用了 `0x00..0x0F`，实际部署记得换成随机密钥。pymavlink 只是生成器，不参与运行，不用配。

### 3.7 编译和验证

1. PX4：先清除所有的配置`make clean`,然后`make px4_sitl gz_x500`（或你的板子），起来后日志里应该有 `AES-GCM encryption enabled for instance 0`，然后执行`mavlink start -p -o 14550`向14550端口发送遥测数据。
2. QGC：Qt Creator 编译，连上飞控后看日志 `AES-GCM encryption enabled for channel N`。
3. 联调：心跳、姿态、参数能正常收发就算通了。想确认到底有没有加密，抓串口包看：帧尾多了 28 字节，payload 已经是密文。

## 4. 踩过的坑

- **忘了定义宏**——最常见，改了代码发现没反应，先回去看宏开没开。
- **两端密钥不一致**——tag 校验失败，payload 被清空丢弃，现象是收不到数据。
- **v1 不支持**——v1 没有 `incompat_flags`，加密只对 v2 生效，v1 链路继续走明文。
- **nonce 不能重用**——同一个密钥下 nonce 千万别重复。示例里 PX4 用了内置 xorshift，生产环境建议换成硬件 RNG（PX4 接 `px4_random_callback`，QGC 用 `QRandomGenerator`）。
- **加密和签名别一起开**——GCM 本身就有认证，再开 signing 纯属浪费，建议加密时关掉签名。
- **帧长上限变了**——加密帧多 28 字节，`MAVLINK_MAX_PACKET_LEN` 从 280 调到 308，别在别处还硬编码着旧值。
