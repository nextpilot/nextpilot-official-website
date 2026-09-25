---
order: 6
title: Downloads
---

# Downloads

NextPilot navigation flight control currently supports only the NP-FCC-H05 series. This flight controller uses two STM32H7 main control chips, running the flight control program and the inertial navigation program separately, so we provide two firmware images (flight control firmware and navigation firmware). The flight control firmware must be downloaded through FCS-USB and the navigation firmware through AHRS-USB.

::: tip
Because the two main control chips are identical, they are easy to confuse. Always check the firmware type and select the matching USB port before flashing!!! Refer to the product documentation for how the two USB ports are connected.
:::

## Flight Control Firmware

Choose the firmware for your scenario. The latest versions are listed below (flashed through the FCS-USB port); for earlier releases see the [release notes](./changelog.md).

- Real flight firmware: [fcs-v4-default.bin](/assets/files/fcs-v4-default.bin)

- Hardware-in-the-loop firmware HITL: [fcs-v4-default-hitl.bin](/assets/files/fcs-v4-default-hitl.bin)

- Software-in-the-loop firmware SITL: [sitl-qemu.bin](/assets/files/sitl-qemu.bin)

## Navigation Firmware

The latest version is listed below (flashed through the AHRS-USB port); for earlier releases see the [release notes](./changelog.md).

- Navigation firmware: [ins-v4-default.bin](/assets/files/ins-v4-default.bin)

## Ground Station Software

### Baidu Netdisk Download

Shared files: nextpilot-user-assets
Link: <https://pan.baidu.com/s/1-OiGOEX7B2mDmwkJNmagVg> Extract code: next

### SITL Scripts {#sitl-scripts}

See software-in-the-loop simulation for how to use the related scripts.

- SITL startup script (required): [start-qemu.bat](/assets/scripts/start-qemu.bat);

- Log extraction script (optional): [extract-sd.bat](/assets/scripts/extract-sd.bat);
