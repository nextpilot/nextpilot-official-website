---
order: 4
title: MAVLink Protocol Customization
description: MAVLink protocol customization, from protocol-layer privatization to SDK packaging, building a secure and efficient UAV communication system.
summary: |
  From protocol-layer privatization to SDK packaging, building a secure and efficient UAV communication system.
  - MAVLink frame header / checksum privatization
  - Frame payload encryption, decryption and key management
  - MAVSDK cross-platform SDK customization and packaging
  - Custom messages and API interface customization
cover: /assets/images/solution/mavlink.png
---

# MAVLink Protocol Customization

> MAVLink, MAVSDK and QGroundControl are all contributed and maintained by the MAVLink open-source team.

## MAVLink Customization

<img src="/assets/images/solution/mavlink.png" alt="" loading="lazy" />

MAVLink (Micro Air Vehicle Link) is a communication protocol for small unmanned vehicles, first released in 2009. It is widely used for communication between ground control stations (GCS) and unmanned vehicles, as well as for internal communication among onboard subsystems. The protocol defines the rules for parameter transmission in the form of a message library. The MAVLink protocol supports unmanned fixed-wing aircraft, unmanned rotorcraft, unmanned ground vehicles and other vehicle types.

MAVLink customization services from the NextPilot team include:

- MAVLink protocol introduction, frame structure definition, etc.
- How to use the MAVLink library, including the existing MAVLink microservice framework
- How to define MAVLink messages and generate MAVLink code
- How to use MAVROS, MAVProxy, etc.
- **How to debug MAVLink with Wireshark**
- Integrating MAVLink into the ground station and flight controller
- **Modifying the MAVLink frame header, checksum method, etc. for private customization**
- **MAVLink frame payload encryption, decryption and key management**

## MAVSDK Customization

<img src="/assets/images/solution/mavsdk.png" alt="" loading="lazy" />

MAVSDK is an SDK for UAV application development based on the MAVLink communication protocol. With MAVSDK you can quickly connect to a flight controller, retrieve flight controller data and perform flight control, helping developers deploy solutions rapidly. It can be deployed on Windows, Linux, Android and other platforms, and supports multiple languages such as C/C++, Python and Java.

::: note
Using MAVSDK hides communication details from customers, improving ease of use as well as communication security and privacy. MAVSDK can be used for `onboard mission computer to flight controller communication`, and also for `ground station and third-party program protocol parsing`.
:::

MAVSDK customization services from the NextPilot team include:

- MAVSDK development environment setup, dynamic library generation and usage;
- MSG message customization: customize MAVLink messages and add message reception and parsing according to customer requirements;
- API interface customization: modify existing or add new API interfaces as needed;
- MAVSDK renaming: rename and build your own SDK library according to actual needs.
