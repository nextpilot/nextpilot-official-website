---
title: 'Encrypting MAVLink: A Full Walkthrough of Adding AES-128-GCM to PX4 + QGC'
shortTitle: MAVLink AES-GCM Link Encryption
description: Implementing an AES-128-GCM authenticated encryption layer on top of MAVLink v2 — encrypting only the payload, appending nonce and tag at the frame end, with the pymavlink generator, full integration steps for PX4 and QGroundControl, and a record of pitfalls.
summary: Implementing an AES-128-GCM authenticated encryption layer on top of MAVLink v2 — encrypting only the payload, with the nonce and tag required for decryption appended at the frame end (after the signature). The CRC does not cover them, adding 28 bytes in total. Includes the pymavlink generator, full integration steps for PX4 and QGroundControl, and a record of pitfalls.
date: 2026-09-08
category: MAVLink
tags: [MAVLink, AES-GCM, Link Encryption, PX4, QGroundControl]
cover: /assets/images/blog/mavlink-aes-gcm.jpg
---

# Encrypting MAVLink: A Full Walkthrough of Adding AES-128-GCM to PX4 + QGC

Some background first: the flight controller and the ground station talk over MAVLink, which is essentially a plaintext serial port or telemetry link — anyone who gets hold of the link can read the flight data end to end. MAVLink v2 officially provides signing, which only prevents tampering and does not encrypt the content. What I needed was "even if the packet is captured, it cannot be read", so I simply added my own AES-128-GCM authenticated encryption layer to MAVLink.

The approach in one sentence: **encrypt only the payload**, keep the header and CRC in plaintext with the CRC algorithm exactly as in the original; append a 12-byte nonce and a 16-byte tag at the frame end, adding 28 bytes in total. The whole capability is controlled by the `MAVLINK_USE_AES_ENCRYPTION` macro — if you do not define it, the build output is byte-for-byte the same as vanilla MAVLink.

I have organized everything into a repository ([Gitee](https://gitee.com/nextpilot/nextpilot-sercue-mavlink.git) | [GitHub](https://github.com/nextpilot/nextpilot-sercue-mavlink.git)):

```bash
git clone https://gitee.com/nextpilot/nextpilot-sercue-mavlink.git
```

The directory layout:

```
├── MAVLINK_AES_GCM.md          # algorithm principles, frame structure, packing / parsing flow (all the details are here)
├── c_library_v2-aes-gcm/       # modified MAVLink C library (with the AES changes)
├── pymavlink/                  # changes to the MAVLink code generator
├── PX4-Autopilot-1.17.0/       # PX4 source changes required
└── qgroundcontrol-4.4.5/       # QGC source changes required
```

## 1. Build Environment

These changes are based on the following versions:

| Component               | Version               | Notes                                              |
| ----------------------- | --------------------- | -------------------------------------------------- |
| Flight control firmware | PX4-Autopilot v1.17.0 | changes in `src/modules/mavlink/`                  |
| Ground station          | QGroundControl v4.4.5 | changes in `src/comm/`                             |
| Code generator          | pymavlink             | shipped as a PX4 submodule; `mavgen_c.py` modified |
| MAVLink protocol        | v2.0                  | encryption applies to v2 only; v1 unsupported      |
| Qt (building QGC)       | 5.15.2                | -                                                  |
| OS (building PX4)       | Ubuntu 22.04          | official PX4 toolchain                             |

## 2. Encryption Method

Below is a step-by-step account of what was changed in each directory and why.

### 2.1 Why AES-GCM

The options available for MAVLink are roughly these:

| Scheme            | Confidentiality | Integrity                   | Frame Overhead | Notes                                          |
| ----------------- | --------------- | --------------------------- | -------------- | ---------------------------------------------- |
| Plain CRC         | ✗               | CRC-16 error detection only | 0              | Status quo, fully plaintext                    |
| MAVLink signing   | ✗               | SHA-256 signature           | 13 bytes       | Prevents tampering but does not encrypt        |
| **AES-GCM**       | ✓               | GMAC strong authentication  | 28 bytes       | Encryption and authentication in one pass      |
| ChaCha20-Poly1305 | ✓               | Poly1305                    | 28 bytes       | Also good, but no hardware acceleration on MCU |

The reason for choosing AES-GCM is simple: a single GCM operation handles both encryption and authentication, with no extra signature needed; mainstream MCUs such as the STM32 and ESP32 have AES hardware engines; and the pure software implementation is small (one S-box plus 176 bytes of round keys), which embedded targets handle easily.

### 2.2 What the Frame Looks Like After Encryption

Only the payload is touched; everything else is preserved as is. The nonce and tag are appended at the frame end (after the signature) and are not covered by the CRC:

```
┌───────────┬──────────────┬─────┬──────────┬──────────────┬─────────────┐
│ header    │ payload      │ CRC │ signature│ nonce        │ auth_tag    │
│ (10B)     │ (N bytes)    │(2B) │(opt,13B) │ (12B,plaintext)│ (16B,plaintext)│
└───────────┴──────────────┴─────┴──────────┴──────────────┴─────────────┘
          ← original MAVLink v2 frame →              ← encryption additions →
```

Key points:

- `len` is still the original payload length, excluding nonce/tag.
- The CRC is identical to the original: `CRC(header[1..9] + payload + crc_extra)`; nonce/tag are not included.
- `incompat_flags` in the header is set to `0x02` (`MAVLINK_IFLAG_ENCRYPTED`) to tell the peer "this frame is encrypted".
- Only v2 supports encryption; v1 has no `incompat_flags` and therefore cannot declare an encrypted frame.

The receiver state machine is simple too: after reading the CRC, if the `ENCRYPTED` bit is set, read 12 bytes of nonce → 16 bytes of tag → decrypt and verify. Non-encrypted frames take the old path and behave exactly as before.

## 3. How to Make the Changes

The changes fall into three layers:

1. **pymavlink generator**: make `mavgen` automatically include the AES header when generating the C library.
2. **PX4 / QGC**: wire in the C library, load the key, bind the channel, and enable the macro.

In terms of order, the generator comes first, then the C library; only with the C library can PX4 and QGC use it. But the repository already ships a generated C library (`c_library_v2-aes-gcm/`), so if you do not want to touch the generator you can take the ready-made library and modify PX4/QGC directly, skipping the first layer.

### 3.1 Modifying the pymavlink Generator

The pymavlink C code generator lives under `generator/`; the fixed headers (`mavlink_types.h`, `mavlink_helpers.h`, etc.) are in `generator/C/include_v2.0/`.

Only two things need changing:

**① Copy 3 files into `generator/C/include_v2.0/`** (overwriting same-named files):

```
mavlink_helpers.h      ← overwrite
mavlink_types.h        ← overwrite
mavlink_aes_gcm.h      ← new
```

**② Modify `generator/mavgen_c.py`**: find `copy_fixed_headers()` (around line 568) and add `'mavlink_aes_gcm.h'` at the end of the `"2.0"` list:

```python
def copy_fixed_headers(directory, xml):
    '''copy the fixed protocol headers to the target directory'''
    import shutil, filecmp
    hlist = {
        "0.9": [ 'protocol.h', 'mavlink_helpers.h', 'mavlink_types.h', 'checksum.h' ],
        "1.0": [ 'protocol.h', 'mavlink_helpers.h', 'mavlink_types.h', 'checksum.h', 'mavlink_conversions.h' ],
        "2.0": [ 'protocol.h', 'mavlink_helpers.h', 'mavlink_types.h', 'checksum.h', 'mavlink_conversions.h',
                 'mavlink_get_info.h', 'mavlink_sha256.h', 'mavlink_aes_gcm.h' ]   # ← add here
        }
    ...
```

Regenerate once and you get a C library with the AES changes, structured exactly like `c_library_v2-aes-gcm/` in the repository:

```bash
python -m pymavlink.tools.mavgen --lang=C --wire-protocol=2.0 \
    --output=c_library_v2-aes-gcm message_definitions/v1.0/all.xml
```

In the generated library, the fixed headers sit at the root, and dialects such as `common/`, `minimal/` and `standard/` are subdirectories that reference the fixed headers via `../xxx.h`.

### 3.2 The Three Files in the MAVLink C Library

This layer is the main event; the PX4/QGC changes later only call the interfaces here. Three files:

#### 3.2.1 `mavlink_aes_gcm.h` (new)

A complete AES-128-GCM software implementation. The key exported symbols are:

```c
#define MAVLINK_AES_KEY_LEN    16   // key: 16 bytes
#define MAVLINK_AES_NONCE_LEN  12   // nonce: 12 bytes
#define MAVLINK_AES_TAG_LEN    16   // tag: 16 bytes

typedef struct __mavlink_aes_gcm_state {
    uint8_t  key[16];                      // pre-shared key
    uint8_t  flags;                        // MAVLINK_AES_FLAG_ENCRYPT_OUTGOING, etc.
    mavlink_aes_gcm_random_callback random_callback; // optional hardware RNG; NULL uses the built-in xorshift
    uint32_t prng_state;                   // built-in PRNG seed
} mavlink_aes_gcm_state_t;

#define MAVLINK_AES_FLAG_ENCRYPT_OUTGOING 0x01   // enable encryption for outgoing frames

void mavlink_aes_gcm_encrypt(mavlink_message_t *msg, mavlink_status_t *status);
bool mavlink_aes_gcm_decrypt(mavlink_message_t *msg, mavlink_status_t *status);
```

#### 3.2.2 `mavlink_types.h`

| Change                                                   | Notes                                    |
| -------------------------------------------------------- | ---------------------------------------- |
| `mavlink_message_t` gains `aes_nonce[12]`, `aes_tag[16]` | Per-packet nonce and tag                 |
| `mavlink_status_t` gains an `aes_gcm` pointer            | Points to the GCM state for this channel |
| Adds `MAVLINK_IFLAG_ENCRYPTED (0x02)`                    | Encrypted frame flag bit                 |
| `MAVLINK_IFLAG_MASK` → `0x03`                            | SIGNED + ENCRYPTED                       |
| `MAVLINK_MAX_PACKET_LEN` +28 when encryption is enabled  | 280 → 308                                |
| Adds parse states `GOT_AES_NONCE`, `GOT_AES_TAG`         | Read nonce/tag after the CRC             |

#### 3.2.3 `mavlink_helpers.h`

- **Sending**: in `mavlink_finalize_message_buffer()` / `_mav_finalize_message_chan_send()` / `mavlink_msg_to_send_buffer()`, when the channel has `aes_gcm` configured with the `ENCRYPT_OUTGOING` flag: encrypt the payload in place → set the `ENCRYPTED` bit → serialize nonce+tag at the frame end.
- **Receiving**: the state machine adds two states after the CRC, `GOT_AES_NONCE` (read 12 bytes) → `GOT_AES_TAG` (read 16 bytes), then calls `mavlink_aes_gcm_decrypt()` to verify the tag and decrypt.

All changes are wrapped in `#ifdef MAVLINK_USE_AES_ENCRYPTION ... #endif`; without the macro you get native behavior.

### 3.3 Wiring the C Library into PX4

PX4 uses the mavlink headers under `src/modules/mavlink/`. First overwrite the three modified fixed headers (locate where the original `mavlink_types.h` lives, usually `src/modules/mavlink/mavlink/pymavlink/generator/C/include_v2.0`):

```bash
find src/modules/mavlink/pymavlink/generator/C/include_v2.0 -name mavlink_types.h   # locate first

cp c_library_v2-aes-gcm/mavlink_aes_gcm.h  src/modules/mavlink/mavlink/pymavlink/generator/C/include_v2.0
cp c_library_v2-aes-gcm/mavlink_types.h     src/modules/mavlink/mavlink/pymavlink/generator/C/include_v2.0
cp c_library_v2-aes-gcm/mavlink_helpers.h   src/modules/mavlink/mavlink/pymavlink/generator/C/include_v2.0
```

Then modify three source files.

#### 3.3.1 `mavlink_main.h`

Add AES-related members and interfaces to the class, wrapped in the macro:

```cpp
#ifdef MAVLINK_USE_AES_ENCRYPTION
public:
 mavlink_aes_gcm_state_t* get_aes_state(void) { return &_aes_state; }
private:
 void init_aes_encryption(void);              ///< initialize AES encryption
 mavlink_aes_gcm_state_t _aes_state{};        ///< AES-GCM encryption state
 uint8_t _aes_key[MAVLINK_AES_KEY_LEN];       ///< AES-128 pre-shared key
#endif
```

#### 3.3.2 `mavlink_main.cpp`

Two changes in total.

**① In the constructor, add one initialization line after `_receiver(*this)`**:

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

**② Add the `init_aes_encryption()` implementation at the end of the file**:

```cpp
#ifdef MAVLINK_USE_AES_ENCRYPTION
void Mavlink::init_aes_encryption(void)
{
 // 1. Pre-shared key (hardcoded here; in a real project read it from a parameter)
 static const uint8_t pre_shared_key[MAVLINK_AES_KEY_LEN] = {
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
  0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F
 };
 memcpy(_aes_key, pre_shared_key, MAVLINK_AES_KEY_LEN);
 memcpy(_aes_state.key, pre_shared_key, MAVLINK_AES_KEY_LEN);

 // 2. Enable encryption for outgoing frames (the receiving side decrypts automatically)
 _aes_state.flags = MAVLINK_AES_FLAG_ENCRYPT_OUTGOING;

 // 3. PRNG seed (using the built-in xorshift; use the callback if you have a hardware RNG)
 _aes_state.prng_state = 0x12345678;

 // 4. (Optional) switch to hardware random numbers
 // _aes_state.random_callback = px4_random_callback;

 // 5. Bind to the MAVLink channel
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

In the message handling loop, before actually processing a message, make sure the current channel has the AES state bound:

```cpp
// ========== New: ensure the AES state is bound ==========
#ifdef MAVLINK_USE_AES_ENCRYPTION
 // If the current channel has no AES state bound, bind it once
 mavlink_status_t *status = mavlink_get_channel_status(_mavlink.get_channel());
 if (status && status->aes_gcm == nullptr) {
  status->aes_gcm = _mavlink.get_aes_state();
  PX4_INFO("AES-GCM bound to channel %d", _mavlink.get_channel());
 }
#endif // MAVLINK_USE_AES_ENCRYPTION

 // ... original message handling ...
```

### 3.4 Wiring the C Library into QGC (Ground Station)

The QGC mavlink headers are in `libs/mavlink/include/mavlink/v2.0/`; overwrite the same three files:

```bash
cp c_library_v2-aes-gcm/mavlink_aes_gcm.h  libs/mavlink/include/mavlink/v2.0/
cp c_library_v2-aes-gcm/mavlink_types.h     libs/mavlink/include/mavlink/v2.0/
cp c_library_v2-aes-gcm/mavlink_helpers.h   libs/mavlink/include/mavlink/v2.0/
```

Then modify two source files.

#### 3.4.1 `MAVLinkProtocol.h`

```cpp
// New: AES
#ifdef MAVLINK_USE_AES_ENCRYPTION
 void setupAESForLink(LinkInterface *link);
 void teardownAESForLink(LinkInterface *link);
 QMap<LinkInterface*, mavlink_aes_gcm_state_t*> _aesStates; ///< AES state per link
#endif
```

#### 3.4.2 `MAVLinkProtocol.cc`

Four changes in total.

**① Add a random number callback at the top of the file** (using Qt's `QRandomGenerator`):

```cpp
// Random number callback
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

**② Clean up leftover AES state in the destructor**:

```cpp
MAVLinkProtocol::~MAVLinkProtocol()
{
 storeSettings();
 _closeLogFile();

#ifdef MAVLINK_USE_AES_ENCRYPTION
 // Clean up all leftover AES state
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

**③ Lazily initialize per link in `receiveBytes()`**:

```cpp
void MAVLinkProtocol::receiveBytes(LinkInterface *link, QByteArray b)
{
 SharedLinkInterfacePtr linkPtr = _linkMgr->sharedLinkInterfacePointerForLink(link, true);
 if (!linkPtr) {
  qCDebug(MAVLinkProtocolLog) << "receiveBytes: link gone!";
  return;
 }
#ifdef MAVLINK_USE_AES_ENCRYPTION
 // Initialize AES if this link has not been initialized yet
 if (!_aesStates.contains(link)) {
  setupAESForLink(link);
 }
#endif
 // ... original parsing logic ...
}
```

**④ Add `setupAESForLink()` / `teardownAESForLink()` at the end of the file**:

```cpp
// New: AES
#ifdef MAVLINK_USE_AES_ENCRYPTION
void MAVLinkProtocol::setupAESForLink(LinkInterface *link)
{
 if (!link) {
  return;
 }
 if (_aesStates.contains(link)) {
  return;   // avoid duplicate initialization
 }

 int channel = link->mavlinkChannel();
 if (channel < 0 || channel >= MAVLINK_COMM_NUM_BUFFERS) {
  qCDebug(MAVLinkProtocolLog) << "Invalid channel for AES init:" << channel;
  return;
 }

 mavlink_aes_gcm_state_t *aesState = new mavlink_aes_gcm_state_t;
 memset(aesState, 0, sizeof(mavlink_aes_gcm_state_t));

 // 1. Pre-shared key (must match the flight controller side)
 static const uint8_t pre_shared_key[MAVLINK_AES_KEY_LEN] = {
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
  0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F
 };
 memcpy(aesState->key, pre_shared_key, MAVLINK_AES_KEY_LEN);

 // 2. Enable encryption for outgoing frames (reception decrypts automatically)
 aesState->flags = MAVLINK_AES_FLAG_ENCRYPT_OUTGOING;

 // 3. PRNG seed (optional when using an external callback)
 aesState->prng_state = 0x12345678;

 // 4. Use QGC's own random number callback
 aesState->random_callback = qgc_random_callback;

 // 5. Bind to the MAVLink channel
 mavlink_status_t *status = mavlink_get_channel_status(channel);
 if (status) {
  status->aes_gcm = aesState;
 } else {
  qCWarning(MAVLinkProtocolLog) << "Failed to get channel status for AES init";
  delete aesState;
  return;
 }

 // 6. Store it, and clean up when the link disconnects
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

### 3.5 Enabling the Macro (the Step Most Easily Forgotten)

All the changes above are wrapped in `#ifdef MAVLINK_USE_AES_ENCRYPTION` — **if you do not define this macro, you have effectively changed nothing**. Two options:

**Option A: modify `mavlink_types.h` (simplest)**

The file reserves a commented-out macro line; uncomment it:

```c
//#define MAVLINK_USE_AES_ENCRYPTION //enable AES encryption
   ↓
#define MAVLINK_USE_AES_ENCRYPTION   //enable AES encryption
```

Note that PX4 and QGC each have their own copy of `mavlink_types.h` — both must be changed.

**Option B: inject via build flags (recommended for production)**

- PX4 (CMake): add `add_definitions(-DMAVLINK_USE_AES_ENCRYPTION)` in `src/modules/mavlink/CMakeLists.txt`
- QGC (qmake): add `DEFINES += MAVLINK_USE_AES_ENCRYPTION` in `qgroundcontrol.pro`

### 3.6 The Key Must Match on Both Sides

AES-GCM is symmetric encryption, so the flight controller and the ground station must use **exactly the same 16-byte key**. If the keys do not match, tag verification fails on the receiving side and the payload is zeroed and discarded — which shows up as "the ground station receives nothing".

The two places to check:

1. PX4 `mavlink_main.cpp`, `init_aes_encryption()`
2. QGC `MAVLinkProtocol.cc`, `setupAESForLink()`

The examples above both use `0x00..0x0F`; remember to replace it with a random key in real deployments. pymavlink is only a generator and does not participate at runtime, so it needs no configuration.

### 3.7 Build and Verify

1. PX4: clear all configuration first with `make clean`, then `make px4_sitl gz_x500` (or your board). After startup the log should show `AES-GCM encryption enabled for instance 0`, then run `mavlink start -p -o 14550` to send telemetry to port 14550.
2. QGC: build with Qt Creator; after connecting to the flight controller, look for `AES-GCM encryption enabled for channel N` in the log.
3. Joint debugging: if heartbeat, attitude and parameters are exchanged normally, it works. To confirm whether encryption is really applied, capture the serial packets: the frame end is 28 bytes longer and the payload is ciphertext.

## 4. Pitfalls I Hit

- **Forgetting to define the macro** — the most common one. If your code changes appear to have no effect, check whether the macro is enabled.
- **Keys mismatched between the two ends** — tag verification fails and the payload is cleared and discarded; the symptom is no data received.
- **v1 is unsupported** — v1 has no `incompat_flags`, so encryption only takes effect on v2; v1 links continue in plaintext.
- **Never reuse a nonce** — never repeat a nonce under the same key. The example uses the built-in xorshift on PX4; for production switch to a hardware RNG (PX4: hook up `px4_random_callback`; QGC: use `QRandomGenerator`).
- **Do not enable encryption and signing together** — GCM already provides authentication, so signing on top is pure waste; disable signing when using encryption.
- **The frame length limit changed** — encrypted frames are 28 bytes longer, so `MAVLINK_MAX_PACKET_LEN` goes from 280 to 308; do not keep the old value hardcoded elsewhere.
