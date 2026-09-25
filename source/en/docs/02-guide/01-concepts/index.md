---
title: Basic Concepts
description: NextPilot basic concepts, introducing what unmanned vehicles are and comparing multirotor, helicopter, fixed-wing and VTOL airframes.
draft: true
---

# Basic Concepts

This topic provides a basic introduction to UAVs and using NextPilot (mainly for new users, but also a good primer for experienced users).

If you are already familiar with the basic concepts, you can move on to [Quick Start](../03-quickstart/01-preparation.md) to learn how to wire and install the autopilot hardware, and how to use the **ground control station** to flash firmware and configure the autopilot.

## UAVs

A drone, or unmanned vehicle (UV), is an unmanned "robot" that can be controlled manually or autonomously. They can fly in the air, on the ground or underwater, and are widely used in consumer, industrial, government and military fields, including aerial photography / video, cargo transport, racing, search and surveying. Unmanned vehicles are generally categorized as unmanned aerial vehicles (UAV), unmanned ground vehicles (UGV), unmanned surface vehicles (USV) and unmanned underwater vehicles (UUV).

> The term unmanned aircraft system (UAS) usually refers to the UAV together with all its other components, including the ground control station and / or radio controller, as well as other systems used to control the UAV and to capture and process data.

NextPilot supports many different airframes (types), and within each type there are many variants. The following are some types and the scenarios they suit best.

- Multirotors — Multirotors offer precise hovering and vertical takeoff at the cost of shorter flight times and generally lower speed. They are the most popular vehicle type, partly because they are easy to assemble, and NextPilot offers several modes that make them easy to fly, making them ideal as camera platforms.

- Helicopters — Helicopters offer advantages similar to multirotors, but with a more complex mechanical structure and higher efficiency. They are also harder to fly.

- Airplanes (fixed-wing) — Fixed-wing vehicles fly longer and faster than multirotors, so they cover more ground for surveys. However they are harder to fly and land than multirotors, and are unsuitable if you need to hover or fly very slowly (for example when surveying vertical structures).

- Vertical takeoff and landing (VTOL) — Hybrid fixed-wing / multirotor vehicles offer the best of both worlds: they take off vertically and hover like a multirotor, while flying forward like an airplane to cover greater distances. VTOL aircraft are generally more expensive than multirotors and fixed-wing aircraft, and harder to build and tune. They come in several types: tiltrotors, tailsitters, quadplanes and more.

## Autopilot

The autopilot is the "brain" of the UAV.

At its minimum it is the flight stack software running on flight controller (FC) hardware and a real-time operating system ("RTOS"). The flight stack provides the necessary stabilization and safety functions, and usually also offers a degree of pilot assistance for manual flight and automation of common tasks such as takeoff, landing and executing planned missions.

Some autopilots also include a general-purpose computing system that can provide "higher-level" command and control and support more advanced networking, computer vision and other functions. This may be implemented as a separate companion computer, but increasingly it is likely to become a fully integrated component in the future.

## Ground Control Station
