---
title: Data Forwarding
description: NextPilot data forwarding, describing scenarios for relaying vehicle data to a remote host, how to create forwarding connections and the additional options.
---

# Data Forwarding

## Introduction

Data forwarding means the ground station can forward UAV data to a remote host, achieving "data sharing". In this case the ground station acts as a "relay station", forwarding communication between the UAV and the remote host!

The following data forwarding scenarios are currently implemented for business needs:

1. Forwarding data during simulation;

2. Transparent forwarding of raw data;
3. Forwarding data to the control tower, command center, etc. during field flights (requires development according to the protocol).

## Creating a Forwarding Link

### Opening the Data Forwarding Screen

In the Tools section of the left sidebar of the ground station, click `Data Forwarding` to open the data forwarding screen, as shown below:

<img src="/assets/images/manual/forward-open.png" alt="forward-open" loading="lazy" />

### Adding a Link

Click Add to create a new data forwarding link. The main settings are:

Name: fill in according to your use case;

Protocol: OriginalMAV (raw protocol, the same as the UAV communication protocol);

Interface: serial port or UDP. For a serial port, select the port number and set the baud rate; for UDP, select the destination address and destination port number;

UAV to connect: select the UAV currently communicating with the ground station from the drop-down list.

<img src="/assets/images/manual/forward-add.png" alt="forward-add" loading="lazy" />

### Connecting

Select the link on the left and click the Connect button below.

<img src="/assets/images/manual/forward-connect.png" alt="forward-connect" loading="lazy" />

## Other Settings

### Disabling Uplink Data

If you do not want the remote host to control the UAV, check `Disable uplink data`; the ground station then automatically blocks uplink control data from the remote host.
