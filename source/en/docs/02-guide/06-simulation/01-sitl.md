# Software-In-The-Loop Simulation (SITL)

## Introduction

Software-in-the-loop simulation creates a software simulation environment on a computer, simulating a real aircraft through a six-degree-of-freedom model; all sensors are virtual.

> Note: software-in-the-loop simulation only supports UDP communication connections.

## Simulation Environment Setup

- Operating system: Windows;
- Software: QEMU, ground control station.

### Installing QEMU

1. Download [QEMU for Windows – Installers (64 bit)](https://qemu.weilnetz.de/w64/); version 7.1.0 or later is recommended;

2. Double-click the installer; the default installation on the C drive is fine;

3. After installation, add the QEMU installation directory `C:\Program Files\qemu` to the environment variables.

4. Open a Windows terminal and enter the following command to confirm the installation succeeded

   ```bash
   qemu-system-x86_64 --version
   ```

### Installing the Ground Control Station

On the [Downloads](../../../download/) page, download and install the ground control station; installing it on the D drive is recommended.

## Starting the Simulation

### Creating a Connection

In the General section of the left sidebar of the ground station, click `Device Connection`; once on the device connection screen, click the **Add** button.

<img src="/assets/images/manual/sim-device-connection.png" alt="sim-device-connection" loading="lazy" />

On the newly created device connection screen, click the product drop-down list and select Simulation, change the local port to 14550, and click OK.

<img src="/assets/images/manual/sim-create-connection.png" alt="sim-create-connection" loading="lazy" />

Then click Connect to start the simulation and establish a communication link with the simulated UAV.

<img src="/assets/images/manual/sim-connect-start.png" alt="sim-connect-start" loading="lazy" />

### Main Screen

After starting the simulation, the UAV is shown on the map on the main screen.

> The default airframe is a VTOL fixed-wing.

<img src="/assets/images/manual/sim-main.png" alt="sim-main" loading="lazy" />

### QEMU Terminal

In the Tools section of the left sidebar of the ground station, click `Link Device`; the link device screen shows the simulation terminal. <img src="/assets/images/manual/sim-qemu-terminal.png" alt="sim-qemu-terminal" loading="lazy" />

You can enter autopilot debug commands in the dialog box at the bottom, for example:

- View current processes

  ```bash
  ps
  ```

- View MAVLink communication status

  ```bash
  mavlink status info
  ```

## Common Operations

### Modifying Parameters

In the Tools section, click `Autopilot Setup`, then click **All Parameters** on the autopilot setup screen. Enter a keyword to find the corresponding parameter.

<img src="/assets/images/manual/sim-modify-param.png" alt="sim-modify-param" loading="lazy" />

### Saving Parameters

Click **Save Parameters** in the top-right corner.

<img src="/assets/images/manual/sim-save-param.png" alt="sim-save-param" loading="lazy" />

### Viewing Logs

In the [SITL Scripts](../../../download/#sitl-scripts) section, download the log extraction script `extract_sd.bat`, then place it in the `SimulationBin` folder under the ground station installation root directory, and copy `sd_14550.bin` and rename it to `sd.bin`.

<img src="/assets/images/manual/sim-log-view.png" alt="sim-log-view" loading="lazy" />

Double-click the `extract_sd.bat` script to extract and create an `sd` folder in the current directory; flight logs can be found in that folder.

> Before running `extract_sd.bat`, 7-Zip must be installed to the default path!
