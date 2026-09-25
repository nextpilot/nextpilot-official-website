---
layout: product
order: 1
title: NP-RID-Receiver
description: >-
  NP-RID-Receiver is a broadcast-mode UAV remote identification receiver compliant with GB 46750-2025.
  It receives WiFi and Bluetooth broadcast signals, handles up to 50 simultaneous UAV broadcast signals,
  and outputs MAVLink or GB46750 protocol data to supervision software over a serial port.
summary: Broadcast-mode UAV remote identification receiver, compliant with GB 46750-2025, receives WiFi / Bluetooth broadcasts, outputs MAVLink / GB46750 protocol over serial
cover: /assets/images/product/datalink/NP-RID-Receiver-S3-PinWX.png
shopUrl: https://item.taobao.com/item.htm?id=1080770176626&mi_id=0000I6qNljnOrxWQA_s_anzovO7YazA6_WVTqM4mrHshyjM
helpUrl: /en/docs/manual/datalink/np-rid-receiver
price: 199
---

## Product Details

### Overview

NP-RID-Receiver is a broadcast-mode UAV remote identification receiver from NextPilot, compliant with the GB 46750-2025 standard. It receives and parses WiFi beacon frames and Bluetooth broadcast signals, handles up to 50 simultaneous UAV broadcast signals, and connects to supervision software over a USB serial port to meet UAV flight supervision requirements.

### Features

- Receives UAV broadcast data, compliant with the new national standard GB46750-2025;
- Data output over a serial port, supporting the [MAVLink](https://mavlink.io/en/messages/common.html) protocol or JSON format;
- Ground station display support — shows UAV position and status in QGC, NextPilot and MissionPlanner;
- Users can view received UAV remote identification data and device operating status through a web page;
- OTA upgrade support — upload and upgrade firmware through the web page;
- Parameter configuration — quickly set parameters through the debug serial port to control device behavior and functions.
- Extremely simple to connect: a single USB cable provides power supply, configuration and data reception.

::: tip
Because the content of the Chinese national standard protocol is not exactly the same as the MAVLink protocol, MAVLink message fields have to be borrowed for transport in order to output over MAVLink. The few fields that differ are mapped as follows:

| Message                        | Original Field      | Meaning After GB Mapping             |
| ------------------------------ | ------------------- | ------------------------------------ |
| OPEN_DRONE_ID_LOCATION (12901) | status              | Operating status                     |
| OPEN_DRONE_ID_BASIC_ID (12900) | uas_id              | Last 8 digits of the registration ID |
| OPEN_DRONE_ID_SYSTEM (12904)   | classification_type | UAV classification                   |
|                                | category_eu         | Operation category                   |

:::

### Specifications

- Main control chip: ESP32-S3;
- Interfaces: 2 serial ports, 1 USB, 1 CAN;
- Supported received signal types: WiFi broadcast beacon frames, Bluetooth 5;
- Maximum number of signals received: 50;
- Data processing time: ≤ 20 ms;
- Signal reception dynamic range: ≥ 74 dB;
- Output data protocol format: MAVLink / JSON;
- Dimensions: ≤ 62 mm x 23 mm;
- Weight: ≤ 15 g;

### Interface Description

NP-RID-Receiver-S3-PinWX mainly includes the following interfaces:

- USB: **two serial ports** expanded through a USB hub, used to check operating status and configure parameters;
  - Debug serial port: baud rate 115200 (not configurable), outputs device operating status and accepts configuration commands for parameter setting, reboot, etc.;
  - Data output serial port: default baud rate 115200 (configurable), outputs received UAV broadcast information; the data protocol is determined by the CFG_PROTOCOL parameter;
- Pin headers: two pin headers bring out all pins for use as needed.

### Hardware Variants

The following hardware versions are currently supported:

- NP-RID-Receiver-S3-PinWX

| Hardware Appearance                                                                                                      | Hardware Name            | Description                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="/assets/images/product/datalink/NP-RID-Receiver-S3-PinWX.png" alt="NP-RID-Receiver-S3-PinWX" loading="lazy" /> | NP-RID-Receiver-S3-PinWX | Main control chip: ESP32-S3<br />External antenna supported<br />One USB port expands to two serial ports, for debug/parameter configuration and data output<br />All pins brought out through pin headers for easy extension and secondary development |

## Specifications Table

## Downloads

Download the latest firmware through the links below, and refer to the [user manual for OTA upgrade](../../docs/01-manual/datalink/np-rid-receiver.md#ota-upgrade).

| Board                    | Current Firmware Version | Click to Download                                                                                                                                    |
| ------------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| NP-RID-Receiver-S3-PinWX | V1.0                     | [OTA app firmware](/assets/files/NP-RID-Receiver-S3-PinWX-V1.0_app.bin)<br />[OTA web firmware](/assets/files/NP-RID-Receiver-S3-PinWX-V1.0_www.bin) |
|                          |                          |                                                                                                                                                      |

## FAQ

1. The WiFi hotspot is enabled by default; to disable it, set `WIFI_AP_ENABLE=0`;
2. When the WiFi hotspot is enabled, external UAV broadcast data can only be received over Bluetooth — WiFi broadcast information can no longer be received;
3. To perform an OTA upgrade, make sure the WiFi hotspot is enabled (`WIFI_AP_ENABLE=1`) and OTA is enabled (`OTA_ENABLE=1`);

## Changelog

### v1.0

Initial version, completing the basic RID reception functions.

### v1.2

Fixed abnormal data units.
