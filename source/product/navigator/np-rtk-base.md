---
layout: product
order: 2
title: NP-RTK-UM982R
description: >-
  NP-RTK-UM982R 是 NextPilot 自研的便携式地面差分基准站，支持全星座多频点
  GNSS 卫星板卡，可输出 RTCM 差分修正数据与 RTK 定位结果，
  配合机载RTK模块实现厘米级定位，适用于无人机地面基准站应用场景。
summary: 便携式地面差分基准站，全星座多频点GNSS，输出RTCM差分修正数据，实现厘米级RTK定位
cover: /images/product/navigator/base-station-product.png
gallery:
  - /images/product/navigator/base-station-product.png
  - /images/product/navigator/base-station-logo.png
helpUrl: /manual/navigator/np-rtk-base
---

## 产品详情

### 简介

NP-RTK-UM982R 是 NextPilot 团队研发一款地面差分基准站，支持市面上大部分卫星板卡，可之间安装 GNSS 蘑菇头天线。通信接口采用航空连接件，稳定可靠。

地面差分基准站主要功能有：

1. 支持单点定位、RTK、动动 RTk；
1. 可输出位置、速度、航向、差分修正数据。

<!-- ![基准站](/images/product/navigator/base-station-product.png) -->

## 技术参数

### 主要性能

地面差分基准站性能指标说明如下：

1. 供电电压：直流 9~36V；
2. 功耗：＜10W；
3. 天线接头：TNC-KF-1.5；
4. 连接器插头：FGG-2B-319-CLL；
5. 工作温度：-40℃~75℃；
6. 贮存温度：-45℃~80℃；
7. 高低温工作、振动、冲击、电磁兼容符合 GJB 要求。

### 重量尺寸

- 尺寸：140mm×130mm×52mm（长×宽×高）；
- 重量：620g；
- 安装孔直径 5mm，间距 146mm*136mm。

### 电气接口

基准站提供了两个 TNC（内孔外螺纹）天线连接头，其中右侧为主天线接头，左侧为辅天线接头。

基准站提供了航空连接器，型号为 FGG-2B-319-CLL，如下图所示：

![基准站连接器](/images/product/navigator/base-station-logo.png)

### 接口定义

连接器型号为 FGG-2B-319-CLL，引脚定义如下：

| 序号 | 引脚 | 定义               | 功能说明                                               | 外部设备 |
| ---- | ---- | ------------------ | ------------------------------------------------------ | -------- |
| 1    | 1    | POWER              | 供电输入正（DC9~36V）                                  | 电源     |
| 2    | 2    | POWER              |                                                        |          |
| 3    | 3    | GND                | 供电输入负（DC9~36V）                                  |          |
| 4    | 4    | GND                |                                                        |          |
| 5    | 5    | ETH_TXP            | 网口                                                   | 交换机   |
| 6    | 6    | ETH_TXN            |                                                        |          |
| 7    | 7    | ETH_RXP            |                                                        |          |
| 8    | 8    | ETH_RXN            |                                                        |          |
| 9    | 9    | PPS                | PPS                                                    | /        |
| 10   | 10   | EVENT              | EVENT                                                  | /        |
| 11   | 11   | RS422_A1           | GNSS_COM1，输出基准站位置、速度、航向等数据,默认 RS422 | 地面站   |
| 12   | 12   | RS422_B1/RS232_TX1 |                                                        |          |
| 13   | 13   | RS422_Y1/RS232_RX1 |                                                        |          |
| 14   | 14   | RS422_Z1           |                                                        |          |
| 15   | 15   | GND                |                                                        |          |
| 16   | 16   | RS422_A2           | GNSS_COM2，输出差分修正数据,默认 RS422                 | 数据链   |
| 17   | 17   | RS422_B2/RS232_TX2 |                                                        |          |
| 18   | 18   | RS422_Y2/RS232_RX2 |                                                        |          |
| 19   | 19   | RS422_Z2           |                                                        |          |
| 20   | 20   | GND                |                                                        |          |
| 21   | 21   | GND                | 预留                                                   | /        |

## 资料下载

## 常见问题

## 更新记录
