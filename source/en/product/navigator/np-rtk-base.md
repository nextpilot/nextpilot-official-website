---
layout: product
order: 2
title: NP-RTK-UM982R
description: >-
  NP-RTK-UM982R is a portable ground differential reference station developed by NextPilot, supporting all-constellation
  multi-frequency GNSS boards. It outputs RTCM differential correction data and RTK positioning results, and works with
  the onboard RTK module to achieve centimeter-level positioning for UAV ground reference station applications.
summary: Portable ground differential reference station, all-constellation multi-frequency GNSS, outputs RTCM correction data for centimeter-level RTK positioning
cover: /assets/images/product/navigator/base-station-product.png
gallery:
  - /assets/images/product/navigator/base-station-product.png
  - /assets/images/product/navigator/base-station-logo.png
helpUrl: /en/docs/manual/navigator/np-rtk-base
---

## Product Details

### Overview

NP-RTK-UM982R is a ground differential reference station developed by the NextPilot team. It supports most satellite boards on the market and can directly mount a GNSS mushroom antenna. The communication interface uses an aviation connector and is stable and reliable.

### Main Functions

The main functions of the ground differential reference station are:

- Supports single-point positioning, RTK and moving-baseline RTK;
- Outputs position, velocity, heading and differential correction data.

### Main Performance

Specifications of the ground differential reference station:

- Supply voltage: DC 9~36 V;
- Power consumption: < 10 W;
- Antenna connector: TNC-KF-1.5;
- Connector plug: FGG-2B-319-CLL;
- Operating temperature: -40 °C ~ 75 °C;
- Storage temperature: -45 °C ~ 80 °C;
- High and low temperature operation, vibration, shock and electromagnetic compatibility comply with GJB requirements.

### Dimensions and Weight

- Dimensions: 140 mm × 130 mm × 52 mm (L × W × H);
- Weight: 620 g;
- Mounting hole diameter 5 mm, spacing 146 mm × 136 mm.

<!-- <img src="/assets/images/product/navigator/base-station-product.png" alt="Reference station" loading="lazy" /> -->

## Specifications Table

### Electrical Interfaces

The reference station provides two TNC antenna connectors (female inner, male outer thread) — the right one is the primary antenna connector and the left one the secondary.

The reference station provides an aviation connector, model FGG-2B-319-CLL, as shown below:

<img src="/assets/images/product/navigator/base-station-logo.png" alt="Reference station connector" loading="lazy" />

### Pin Definition

The connector model is FGG-2B-319-CLL, with the following pin definitions:

| No. | Pin | Definition         | Function                                                                                 | External Device |
| --- | --- | ------------------ | ---------------------------------------------------------------------------------------- | --------------- |
| 1   | 1   | POWER              | Power input positive (DC 9~36 V)                                                         | Power supply    |
| 2   | 2   | POWER              |                                                                                          |                 |
| 3   | 3   | GND                | Power input negative (DC 9~36 V)                                                         |                 |
| 4   | 4   | GND                |                                                                                          |                 |
| 5   | 5   | ETH_TXP            | Ethernet                                                                                 | Switch          |
| 6   | 6   | ETH_TXN            |                                                                                          |                 |
| 7   | 7   | ETH_RXP            |                                                                                          |                 |
| 8   | 8   | ETH_RXN            |                                                                                          |                 |
| 9   | 9   | PPS                | PPS                                                                                      | /               |
| 10  | 10  | EVENT              | EVENT                                                                                    | /               |
| 11  | 11  | RS422_A1           | GNSS_COM1, outputs reference station position, velocity, heading, etc.; RS422 by default | Ground station  |
| 12  | 12  | RS422_B1/RS232_TX1 |                                                                                          |                 |
| 13  | 13  | RS422_Y1/RS232_RX1 |                                                                                          |                 |
| 14  | 14  | RS422_Z1           |                                                                                          |                 |
| 15  | 15  | GND                |                                                                                          |                 |
| 16  | 16  | RS422_A2           | GNSS_COM2, outputs differential correction data; RS422 by default                        | Data link       |
| 17  | 17  | RS422_B2/RS232_TX2 |                                                                                          |                 |
| 18  | 18  | RS422_Y2/RS232_RX2 |                                                                                          |                 |
| 19  | 19  | RS422_Z2           |                                                                                          |                 |
| 20  | 20  | GND                |                                                                                          |                 |
| 21  | 21  | GND                | Reserved                                                                                 | /               |

## Downloads

## FAQ

## Changelog
