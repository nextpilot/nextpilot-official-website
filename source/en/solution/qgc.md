---
order: 3
title: QGroundControl Customization
description: Full-stack ground control station customization based on QGroundControl, supporting one-station-many-vehicles, mission planning, data forwarding and remote command and control.
summary: |
  Full-stack ground station development based on QGroundControl, with proven delivery experience on complex command and control platforms.
  - One station monitoring multiple vehicles, and multiple stations for one vehicle
  - Mission planning, flight display and control, pre-flight checks
  - Data forwarding, remote command hall integration
  - Log replay, MAVLink debugging toolset
cover: /assets/images/solution/qgroundcontrol.png
---

# QGroundControl Customization

<img src="/assets/images/solution/qgroundcontrol.png" alt="" loading="lazy" />

- Proficient in C++, Qt Quick/QML and JavaScript, with experience developing complex user interfaces;
- Extensive GIS development experience, skilled with OpenLayers and QtLocation;
- Familiar with the MAVLink protocol, with full-stack QGroundControl development capability;
- Responsible for the development of multiple ground stations and command center software, as well as several auxiliary design tools.

## Device Connection

<img src="/assets/images/solution/qgc-data-link.jpg" alt="" loading="lazy" />

The ground station supports connection of data links, remote controllers (gamepads) and RTK reference stations, and can be configured to:

- Connect multiple data links from one station to monitor several UAVs simultaneously
- Connect Futaba remote controllers and gamepads, forwarding control data through the ground station to fly the UAV, extending remote control range to tens of kilometers;
- Connect an RTK reference station and transparently transmit RTCM data as well as base station position / velocity / heading through the flight control link to the air end
- **Integrate one-click software-in-the-loop (SITL) simulation** (the ground station integrates the flight dynamics model and flight control algorithms)

Featured capabilities:

- Optionally forward control commands to the UAV to avoid accidental operations
- Monitor and automatically connect communication links on a specified UDP port
- Set the base station installation position (relative coordinates based on an origin)

## Pre-Flight Check

<img src="/assets/images/solution/qgc-pre-check.jpg" alt="" loading="lazy" />

## Flight Controller Setup

<img src="/assets/images/solution/qgc-fcs-setting.jpg" alt="" loading="lazy" />

## Mission Planning

<img src="/assets/images/solution/qgc-mission-plan.jpg" alt="" loading="lazy" />

An independent mission planning interface makes it easy to plan missions across multiple displays. We redesigned the mission planning interface and simplified the planning logic, especially for complex routes, adding a few thoughtful conveniences as well as distance and area measurement in route planning.

In the mission planning interface, users can clearly and intuitively view all detailed information about the current mission, making planning easier.

> The program automatically detects the latitude/longitude format entered by the user (degrees-minutes-seconds or decimal), so no manual conversion is needed. For example, for a latitude of 30°48′33.3″, the user can enter `30 48 33.3` directly or the decimal `30.8092513`, and the program converts it to degrees-minutes-seconds for display, allowing quick input.

## Auxiliary Tools

### Data Forwarding

<img src="/assets/images/solution/qgc-data-forward.png" alt="" loading="lazy" />

The data forwarding function forwards the `telemetry data` received by the ground station to **a specified IP** according to a `specified protocol`, and can also receive remote control commands from **that IP**. Its uses include:

- Remote real-time monitoring: send real-time UAV flight data to a remote server, so users thousands of miles away can monitor UAV flight in real time and control flight or missions
- Remote technical support: transparently transmit **telemetry data** to NextPilot servers, so the technical team can remotely view, operate or debug your UAV
- Command hall integration: display UAV status on the command center situation map and accept remote control commands from the command hall (**remote commands can be blocked**)

### Log Replay

<img src="/assets/images/solution/qgc-data-replay.jpg" alt="" loading="lazy" />

Log replay is an important means of fault analysis; logging must be comprehensive and able to drive ground station replay:

- Record and replay all raw binary data input and output by the ground station
- Record and replay all mouse actions (mouse position and clicks)
- Record and replay ground station software runtime logs
- Support accelerated / decelerated replay and drag-to-seek
- Support creating log folders per flight sortie or per ground station startup
- Support automatic cleanup of log records by date, size or count
- Support extracting flight log data from telemetry data
- Support extracting ground control commands from remote control data

### Debugging Tools

<img src="/assets/images/solution/qgc-debug-tools.png" alt="" loading="lazy" />

The debugging tools are advanced features for development use, including:

- MAVLink Inspector (telemetry monitor): displays received MAVLink messages, frequency and fields, and plots curves
- MAVLink Console (flight controller terminal): a flight controller shell console grafted onto the MAVLink protocol, allowing command-line control of the flight controller
- PID Tune (flight controller tuning): PID tuning for rate, attitude and position control of PX4 flight controllers, with the ability to memorize, restore and fine-tune PID parameters

## Featured Functions

### Multiple Stations, One Vehicle

Multiple ground stations can monitor the UAV simultaneously and communicate with each other; different operation permissions are granted according to the ground station role (flight control, mission planning, payload control and command control), so multiple ground stations working together reduce the workload on individual operators.

<img src="/assets/images/solution/qgc-multi-station.png" alt="" loading="lazy" />

### Formation Control

UAVs fly in coordinated formation; the current formation shape is displayed and can be set and edited through the formation interface.

<img src="/assets/images/solution/qgc-follow-target.png" alt="" loading="lazy" />
