# Flashing Firmware

> Since the navigation flight controller contains two main control chips — one running the flight control system program (FCS) and one running the navigation system program (INS) — the flight control firmware is flashed through `FCS-USB` and the navigation firmware through `AHRS-USB`. The latest firmware is flashed by default at the factory. Because the autopilot program is updated frequently, see the [release notes](../../../download/changelog.md) for the version correspondence between the two firmware images.

## Preparation

Prepare the following:

1. Autopilot firmware — download the required version from [Downloads](../../../download/);
2. Navigation flight controller — see [Products](../../../product/);
3. [Debug board hardware](../../../product/autopilot/np-fcc-h05.md#debug-board) (if you do not have a debug board, you need to connect the USB download interface yourself according to the autopilot interface pinout table);
4. A Type-C USB cable.

## Flashing the Flight Control Firmware

### Selecting the File

Open the ground control station, click `Debug Tools` in the Tools section of the left sidebar and select `Firmware Upgrade`. On the firmware upgrade screen, click the "Select file" button and choose the target firmware in the dialog, as shown below:

<img src="/assets/images/manual/flash-select-file.png" alt="flash-select-file" loading="lazy" />

After selecting the target firmware and closing the dialog, the firmware path is shown in the text box.

### Connecting the Autopilot

Click Find Autopilot, as shown below:

<img src="/assets/images/manual/flash-connect-fcs.png" alt="flash-connect-fcs" loading="lazy" />

Then connect the autopilot **FCS-USB** port to the computer with a Type-C USB cable; the ground station recognizes it immediately and displays the relevant information, as shown below:

<img src="/assets/images/manual/flash-usb-connect.png" alt="flash-usb-connect" loading="lazy" />

### Writing the Firmware

Then click Write Firmware to start the firmware erase and flash process, as shown below:

<img src="/assets/images/manual/flash-write.png" alt="flash-write" loading="lazy" />

When flashing completes, the prompt shown below appears:

<img src="/assets/images/manual/flash-done.png" alt="flash-done" loading="lazy" />

## Flashing the Navigation Firmware

The navigation firmware flashing procedure is the same as for the flight control firmware, with these differences:

- When selecting the file, be sure to select the navigation firmware; navigation firmware file names generally start with `ins_`;
- Connect through `AHRS-USB` to the computer.
