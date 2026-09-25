---
layout: product
order: 2
title: NP-RID-Sender
description: >-
  NP-RID-Sender is a broadcast-mode UAV remote identification transmitter compliant with GB 46750-2025.
  It connects to the autopilot via MAVLink / DroneCAN and broadcasts UAV operating status over WiFi or Bluetooth,
  compatible with mainstream autopilots such as ArduPilot and PX4, meeting UAV flight supervision requirements.
summary: Broadcast-mode UAV remote identification transmitter, compliant with GB 46750-2025, supports MAVLink / DroneCAN, broadcasts operating status over WiFi / Bluetooth
cover: /assets/images/product/datalink/np-rid-sender-gh-board.png
gallery:
  - /assets/images/product/datalink/np-rid-sender-gh-board.png
  - /assets/images/product/datalink/np-rid-sender-gh-appearance.png
shopUrl: https://item.taobao.com/item.htm?id=1074097497449&mi_id=0000KHD5urOB5ulWhlh0CZLkO54UwXlaqMXVS7sOhyvD7lY
helpUrl: /en/docs/manual/datalink/np-rid-sender
price: 120
---

## Product Details

### Overview

NP-RID-Sender is a broadcast-mode UAV remote identification transmitter from NextPilot, compliant with the GB 46750-2025 standard. It broadcasts UAV operating status signals over WiFi or Bluetooth to meet UAV flight supervision requirements. It currently supports MAVLink and DroneCAN connections and works with autopilots such as ArduPilot and PX4 — **if you need support for other autopilots or protocols, custom development is available**.

### Features

- Communicates with the autopilot to obtain UAV operating status;
- WiFi beacon frame broadcast;
- Bluetooth 5 broadcast;
- View UAV status through a web page;
- WiFi telemetry function;
- Virtual RID simulation function;
- Parameter configuration — connect to the device with a serial debug assistant and quickly set all parameters through parameter commands!
- OTA upgrade support;

### Specifications

- Supported main control chips: ESP32-S3 / ESP32-C3;
- Interfaces: 2 serial ports **(autopilot serial port and debug serial port)**, 1 USB, 1 CAN;
- Supported input protocols: MAVLink, DroneCAN;
- Supported transmit signal types: WiFi broadcast beacon frames, Bluetooth 5;
- Transmit power: 20 dBm;
- Transmit protocol: GB46750;

### Hardware Variants

The following hardware versions are currently supported:

- NP-RID-Sender-S3-GH
- NP-RID-Sender-C3-PinMini

| Hardware Appearance                                                                                                      | Hardware Name            | Description                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="/assets/images/product/datalink/np-rid-sender-gh-board.png" alt="NP-RID-Sender-S3-GH" loading="lazy" />        | NP-RID-Sender-S3-GH      | Main control chip: ESP32-S3<br />All features available, can be mounted directly on the UAV<br />External antenna supported<br />Debug serial port is UART2 |
| <img src="/assets/images/product/datalink/np-rid-sender-c3-pinmini.png" alt="NP-RID-Sender-C3-PinMini" loading="lazy" /> | NP-RID-Sender-C3-PinMini | Main control chip: ESP32-C3<br />No external antenna; Bluetooth only, no WiFi broadcast; generally used for testing<br />Debug serial port is UART0         |

## Specifications Table

### NP-RID-Sender-S3-GH

The external interfaces of each hardware variant are described below:

| Interface | Pin Assignment             | Remarks                                                                                                                                                                     |
| --------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| USB       | USB, Type-C                | After plugging into a computer, two USB devices appear: the first is JTAG (program download and debug), the second is USB-to-serial (UART0), which requires a serial driver |
| UART1     | RX: GPIO17<br />TX: GPIO18 | **Autopilot serial port**<br />Default baud rate 115200<br />Connector J6                                                                                                   |
| UART2     | RX: GPIO44<br />TX: GPIO43 | **Debug serial port**<br />Used for debugging and parameter configuration, accessed through the second USB serial port<br />Default baud rate 115200<br />Connector J4      |
| CAN       | RX: GPIO38<br />TX: GPIO47 | Connect directly to the autopilot CAN bus                                                                                                                                   |

### NP-RID-Sender-C3-PinMini

The external interfaces of each hardware variant are described below:

| Interface | Pin Assignment             | Remarks                                                                                                 |
| --------- | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| USB       | USB, Type-C                | Program download and debug, JTAG                                                                        |
| UART0     | RX: GPIO20<br />TX: GPIO21 | **Debug serial port**<br />Used for debugging and parameter configuration<br />Default baud rate 115200 |
| UART1     | RX: GPIO2<br />TX: GPIO3   | **Autopilot serial port**<br />Default baud rate 115200                                                 |
| CAN       | RX: GPIO4<br />TX: GPIO5   | Requires an external CAN transceiver                                                                    |

## Downloads

| Board                    | Current Firmware Version | Click to Download                                                       |
| ------------------------ | ------------------------ | ----------------------------------------------------------------------- |
| NP-RID-Sender-S3-GH      | V1.1                     | [OTA app firmware](/assets/files/NP-RID-Sender-S3-GH-V1.1_OTA.bin)      |
| NP-RID-Sender-C3-PinMini | V1.0                     | [OTA app firmware](/assets/files/NP-RID-Sender-C3-PinMini-V1.0_OTA.bin) |

## FAQ

## Changelog

### v1.0

Initial version, completing the basic RID functions.

### v1.2

Fixed protocol assignment errors, optimized WiFi broadcast, and added time synchronization.
