---
layout: product
order: 1
title: NP-ADS-H05
description: >-
  NP-ADS-H05 is an industrial-grade air data computer developed by NextPilot, with built-in MS5525DSO differential
  pressure sensor, MS5611 barometric altitude sensor and RM3100 magnetometer, supporting dual-channel dynamic/static
  pressure measurement and full-temperature-range compensation for accurate airspeed, barometric altitude and temperature data.
summary: Industrial-grade air data computer with built-in differential pressure / barometric altitude / magnetometer sensors, accurately measuring airspeed, barometric altitude and temperature
cover: /assets/images/product/navigator/airspeed-top-view.png
gallery:
  - /assets/images/product/navigator/airspeed-top-view.png
  - /assets/images/product/navigator/airspeed-front-view.png
helpUrl: /en/docs/manual/navigator/np-ads-h05
---

## Product Details

### Overview

NP-ADS-H05 is an industrial-grade air data computer developed by the NextPilot team. It integrates high-performance digital pressure, barometric altitude and geomagnetic sensors, and can measure static pressure, dynamic pressure and barometric altitude during flight to complete altitude and speed measurement. It uses an aviation connector and is stable and reliable.

### Main Functions

The main functions of the air data computer are:

- Dynamic pressure measurement;
- Temperature measurement;
- Barometric pressure measurement.

Onboard sensors:

- Main control chip: STM32F107
- Airspeed sensor: MS5525DSO
- Barometric altitude sensor: MS5611
- Magnetometer: RM3100

### Main Performance

Specifications of the air data computer:

- Supply voltage: DC 9~36 V;
- Power consumption: < 3 W;
- Altitude measurement range: -300 ~ +6000 m;
- Airspeed measurement range: 0 ~ 335.5 m/s;
- Interfaces: 1 RS422, 1 CAN, 1 IIC, 1 USB;
- Operating temperature: -40 °C ~ 75 °C;
- Storage temperature: -45 °C ~ 80 °C;
- High and low temperature operation, vibration, shock and electromagnetic compatibility comply with GJB requirements.

### Dimensions and Weight

- Dimensions: 58 mm × 44 mm × 26 mm (L × W × H);
- Weight: 56 g;
- Mounting hole diameter 3 mm, spacing 52.5 mm × 50.5 mm.

<!-- <img src="/assets/images/product/navigator/airspeed-top-view.png" alt="Airspeed sensor" loading="lazy" /> -->

## Specifications Table

### Electrical Interfaces

The air data computer provides two connectors for the pitot tubes — PS is the static pressure port and PT is the dynamic pressure port. It provides an aviation connector, model J30J-21ZKW-J, whose pin layout is shown on the right side of the figure below.

<img src="/assets/images/product/navigator/airspeed-front-view.png" alt="Airspeed sensor interfaces" loading="lazy" />

### Pin Definition

The airspeed sensor connector model is J30J-21ZKW-J, with the following pin definitions:

| No. | Pin | Category | Definition | Function                         | External Device                              |
| --- | --- | -------- | ---------- | -------------------------------- | -------------------------------------------- |
| 1   | 1   |          | EARTH      |                                  | Chassis ground                               |
| 2   | 2   | Power    | Power-VCC  | Power input positive (DC 9~36 V) |                                              |
| 3   | 3   |          | Power-VCC  |                                  |                                              |
| 4   | 4   |          | Power-GND  | Power input negative (DC 9~36 V) |                                              |
| 5   | 5   |          | Power-GND  |                                  |                                              |
| 6   | 6   | IIC      | IIC_SCL    |                                  |                                              |
| 7   | 7   |          | IIC_SDA    |                                  |                                              |
| 8   | 8   |          | GND        |                                  |                                              |
| 9   | 9   |          | GND        |                                  |                                              |
| 10  | 10  | CAN      | CANH       |                                  |                                              |
| 11  | 11  |          | CANL       |                                  |                                              |
| 12  | 12  | RS422    | RS422_A    |                                  | Connects to the airspeed port on the INS/FCS |
| 13  | 13  |          | RS422_B    |                                  | Connects to the airspeed port on the INS/FCS |
| 14  | 14  |          | RS422_Y    |                                  | Connects to the airspeed port on the INS/FCS |
| 15  | 15  |          | RS422_Z    |                                  | Connects to the airspeed port on the INS/FCS |
| 16  | 16  |          | NC         |                                  |                                              |
| 17  | 17  |          | NC         |                                  |                                              |
| 18  | 18  | USB      | USB_DM     |                                  |                                              |
| 19  | 19  |          | USB_DP     |                                  |                                              |
| 20  | 20  |          | VBUS       |                                  |                                              |
| 21  | 21  |          | GND        |                                  |                                              |

## Downloads

## FAQ

## Changelog
