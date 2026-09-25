---
title: Documentation
description: NextPilot documentation center, covering product manuals, flight control tutorials, development guides and community support.
order: 4
sidebar: false
# 栏目落地页不显示页底上一页/下一页
prev: false
next: false
---

# Documentation

NextPilot documentation is organized into four sub-sections by purpose: for assembly, configuration and day-to-day operation, see [Product Manuals](/en/docs/manual/) and [Tutorials](/en/docs/guide/); for source builds, custom development and community collaboration, see the [Development Guide](/en/docs/develop/).

::: link-card 2

```yml
- link: /en/docs/manual/
  name: Product Manuals
  icon: 📘
  desc: In-box manuals for hardware products, organized by model — covering wiring and installation, parameter configuration, firmware flashing and ground station operation for airframes, flight controllers, data links and navigation peripherals.
  links: Aircraft|/en/docs/manual/aircraft/, Flight Control|/en/docs/manual/autopilot/, Data Link|/en/docs/manual/datalink/, Navigation|/en/docs/manual/navigator/
- link: /en/docs/guide/
  name: Tutorials
  icon: 🚀
  desc: The complete path from assembly to first flight — airframe selection, sensor calibration, link connection and mission planning, plus SITL / HITL simulation training and advanced operations such as logs and parameters.
  links: Quickstart|/en/docs/guide/quickstart/, Configuration|/en/docs/guide/config/, Simulation|/en/docs/guide/simulation/sitl, Advanced|/en/docs/guide/advanced/
- link: /en/docs/develop/
  name: Development Guide
  icon: 💻
  desc: For source builds and custom development — development environment setup, firmware build and flashing, code structure, plus the uORB / PARAM / AIRFRAME extension architecture and module development.
  links: Flight Control Source|https://github.com/nextpilot/nextpilot-flight-control, Windows Toolchain|https://github.com/nextpilot/nextpilot-windows-toolchain
- link: /en/docs/community/
  name: Community Support
  icon: 💬
  desc: The first stop for Q&A and troubleshooting — scan the QR code to join the group, file an Issue, and learn about the contribution workflow, code of conduct and license.
  links: Technical Support|/en/docs/community/support, Contributing|/en/docs/community/contribute, Code of Conduct|/en/docs/community/code-of-conduct
```

:::

## NextPilot Open-Source Projects

The NextPilot open-source projects revolve around the flight control core, ground control, model design and the development environment.

<div class="repo-grid">
  <article class="repo-card">
    <h3>NextPilot Flight Control <span class="repo-scope">General-Purpose Autopilot</span></h3>
    <p>An autopilot built on the RT-Thread real-time operating system with core algorithms ported from PX4, supporting multirotor, fixed-wing and VTOL aircraft.</p>
    <p><a href="https://nextpilot.org/" target="_blank" rel="noopener noreferrer">Project Home</a> · <a href="https://github.com/nextpilot/nextpilot-flight-control" target="_blank" rel="noopener noreferrer">Repository</a> · <a href="/en/docs/manual/">Product Manuals</a> · <a href="/en/docs/develop/">Development Guide</a></p>
  </article>
  <article class="repo-card">
    <h3>NextPilot Ground Control <span class="repo-scope">Ground Control Station</span></h3>
    <p>Ground control station providing flight monitoring, mission planning, pre-flight checks, log replay and virtual flight simulation.</p>
    <p><a href="https://nextpilot.org/" target="_blank" rel="noopener noreferrer">Project Home</a> · <a href="https://github.com/nextpilot/nextpilot-ground-control" target="_blank" rel="noopener noreferrer">Repository</a> · <a href="/en/docs/guide/simulation/sitl">Simulation Docs</a> · <a href="/en/docs/develop/">Development Guide</a></p>
  </article>
  <article class="repo-card">
    <h3>NextPilot Simulink Project <span class="repo-scope">Model Design & Simulation</span></h3>
    <p>A Simulink project for model-based design, used for control law development and MIL / SIL simulation verification.</p>
    <p><a href="https://nextpilot.org/" target="_blank" rel="noopener noreferrer">Project Home</a> · <a href="https://github.com/nextpilot/nextpilot-simulink-project" target="_blank" rel="noopener noreferrer">Repository</a> · <a href="/en/docs/guide/">Tutorials</a> · <a href="/en/docs/develop/">Development Guide</a></p>
  </article>
  <article class="repo-card">
    <h3>NextPilot Windows Toolchain <span class="repo-scope">Development Toolchain</span></h3>
    <p>A Windows development toolchain for building NextPilot flight control projects on Windows.</p>
    <p><a href="https://nextpilot.org/" target="_blank" rel="noopener noreferrer">Project Home</a> · <a href="https://github.com/nextpilot/nextpilot-windows-toolchain" target="_blank" rel="noopener noreferrer">Repository</a> · <a href="/en/docs/develop/">Development Guide</a></p>
  </article>
</div>

## Mainstream Open-Source Flight Control Projects

Listed below are representative open-source flight control projects in unmanned system development, to help you compare different technical approaches, ecosystems and documentation resources. The title tag indicates the project's primary scope; MAVLink and QGroundControl are supporting projects in the flight control ecosystem rather than flight control firmware. Each project belongs to its own community, and the listing is in no particular order.

<div class="repo-grid">
  <article class="repo-card">
    <h3>PX4 <span class="repo-scope">General-Purpose Unmanned Systems</span></h3>
    <p>An open-source autopilot platform for academic research, engineering development and commercial unmanned systems, with a fairly complete ecosystem of simulation, modules and developer tooling.</p>
    <p><a href="https://px4.io/" target="_blank" rel="noopener noreferrer">Project Home</a> · <a href="https://github.com/PX4/PX4-Autopilot" target="_blank" rel="noopener noreferrer">Repository</a> · <a href="https://docs.px4.io/main/en/" target="_blank" rel="noopener noreferrer">User Guide</a> · <a href="https://docs.px4.io/main/en/development/" target="_blank" rel="noopener noreferrer">Development Guide</a></p>
  </article>
  <article class="repo-card">
    <h3>ArduPilot <span class="repo-scope">General-Purpose Unmanned Systems</span></h3>
    <p>A mature open-source autopilot platform covering multirotor, fixed-wing, rover, boat and submersible vehicle types.</p>
    <p><a href="https://ardupilot.org/" target="_blank" rel="noopener noreferrer">Project Home</a> · <a href="https://github.com/ArduPilot/ardupilot" target="_blank" rel="noopener noreferrer">Repository</a> · <a href="https://ardupilot.org/ardupilot/" target="_blank" rel="noopener noreferrer">User Guide</a> · <a href="https://ardupilot.org/dev/" target="_blank" rel="noopener noreferrer">Development Guide</a></p>
  </article>
  <article class="repo-card">
    <h3>Betaflight <span class="repo-scope">Racing & Acrobatic Multirotor</span></h3>
    <p>Open-source flight control firmware for racing and acrobatic multirotors, emphasizing low-latency flight feel and rich tuning capabilities.</p>
    <p><a href="https://betaflight.com/" target="_blank" rel="noopener noreferrer">Project Home</a> · <a href="https://github.com/betaflight/betaflight" target="_blank" rel="noopener noreferrer">Repository</a> · <a href="https://betaflight.com/docs/wiki" target="_blank" rel="noopener noreferrer">User Guide</a> · <a href="https://betaflight.com/docs/development" target="_blank" rel="noopener noreferrer">Development Guide</a></p>
  </article>
  <article class="repo-card">
    <h3>INAV <span class="repo-scope">Navigation-Oriented Fixed-Wing & Multirotor</span></h3>
    <p>Open-source flight control firmware for navigational flight, suited to fixed-wing, flying wing, VTOL and multirotor model platforms.</p>
    <p><a href="https://inavflight.github.io/" target="_blank" rel="noopener noreferrer">Project Home</a> · <a href="https://github.com/iNavFlight/inav" target="_blank" rel="noopener noreferrer">Repository</a> · <a href="https://github.com/iNavFlight/inav/wiki" target="_blank" rel="noopener noreferrer">User Guide</a> · <a href="https://github.com/iNavFlight/inav/wiki/Development" target="_blank" rel="noopener noreferrer">Development Guide</a></p>
  </article>
  <article class="repo-card">
    <h3>Paparazzi UAV <span class="repo-scope">Research & Autonomous Flight</span></h3>
    <p>An open-source hardware and software platform for UAV research and autonomous flight, providing flight control software, ground tools and development resources.</p>
    <p><a href="https://paparazziuav.org/" target="_blank" rel="noopener noreferrer">Project Home</a> · <a href="https://github.com/paparazzi/paparazzi" target="_blank" rel="noopener noreferrer">Repository</a> · <a href="https://paparazziuav.org/wiki/Getting_Started" target="_blank" rel="noopener noreferrer">User Guide</a> · <a href="https://paparazziuav.org/wiki/Development" target="_blank" rel="noopener noreferrer">Development Guide</a></p>
  </article>
  <article class="repo-card">
    <h3>Rotorflight <span class="repo-scope">Single-Rotor Helicopter</span></h3>
    <p>An actively maintained open-source flight control suite for single-rotor helicopter models, built on the Betaflight ecosystem, offering helicopter-specific attitude control, tuning and rotor speed management.</p>
    <p><a href="https://rotorflight.org/" target="_blank" rel="noopener noreferrer">Project Home</a> · <a href="https://github.com/rotorflight/rotorflight" target="_blank" rel="noopener noreferrer">Repository</a> · <a href="https://rotorflight.org/docs/" target="_blank" rel="noopener noreferrer">User Guide</a> · <a href="https://rotorflight.org/docs/Contributing/intro" target="_blank" rel="noopener noreferrer">Development Guide</a></p>
  </article>
  <article class="repo-card">
    <h3>MAVLink <span class="repo-scope">Communication Protocol</span></h3>
    <p>A lightweight unmanned system communication protocol used to exchange status, control and mission data between the autopilot, ground station and onboard components.</p>
    <p><a href="https://mavlink.io/" target="_blank" rel="noopener noreferrer">Project Home</a> · <a href="https://github.com/mavlink/mavlink" target="_blank" rel="noopener noreferrer">Repository</a> · <a href="https://mavlink.io/en/guide/" target="_blank" rel="noopener noreferrer">User Guide</a> · <a href="https://mavlink.io/en/contributing/contributing.html" target="_blank" rel="noopener noreferrer">Development Guide</a></p>
  </article>
  <article class="repo-card">
    <h3>QGroundControl <span class="repo-scope">Ground Control Station</span></h3>
    <p>A cross-platform open-source ground control station supporting vehicle connection, parameter configuration, mission planning, map operation and flight monitoring.</p>
    <p><a href="https://qgroundcontrol.com/" target="_blank" rel="noopener noreferrer">Project Home</a> · <a href="https://github.com/mavlink/qgroundcontrol" target="_blank" rel="noopener noreferrer">Repository</a> · <a href="https://docs.qgroundcontrol.com" target="_blank" rel="noopener noreferrer">User Guide</a> · <a href="https://dev.qgroundcontrol.com/" target="_blank" rel="noopener noreferrer">Development Guide</a></p>
  </article>
</div>
