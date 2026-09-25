# GNSS Configuration

## UM482

### RTK

Configure the airborne navigation board as follows

```bash
unlogall com1
unlogall com2
set pvtfreq 10
set rtkfreq 10
rtktimeout 15
# com1 configuration
log com1 gpgga ontime 0.1
# com2 configuration
mode rover
log com2 bestvelb ontime 0.1
log com2 bestposb ontime 0.1
log com2 headingb ontime 0.1
com com2 230400
saveconfig
```

Configure the ground navigation board as follows

```bash
unlogall
mode base time 60 1.5 2.5
config com1 230400
log com1 rtcm1006 ontime 5
log com1 rtcm1033 ontime 5
log com1 rtcm1074 ontime 0.5
log com1 rtcm1124 ontime 0.5
log com1 rtcm1084 ontime 0.5
log com1 rtcm1094 ontime 0.5
log com1 bestposb ontime 0.5
log com1 timeb ontime 1
saveconfig
```

## UM982

### RTK

Configure the airborne navigation board as follows

```bash
unlogall com1
unlogall com2
set pvtfreq 10
set rtkfreq 10
rtktimeout 15
# com1 configuration
config com1 230400
log com1 gpgga ontime 0.1
# com2 configuration
mode rover
log com2 bestvelb ontime 0.1
log com2 bestposb ontime 0.1
log com2 headingb ontime 0.1
com com2 230400
saveconfig
```

Configure the ground navigation board as follows

```bash
unlogall
mode base time 60 1.5 2.5
config com1 230400
log com1 rtcm1006 ontime 5
log com1 rtcm1033 ontime 5
log com1 rtcm1074 ontime 0.5
log com1 rtcm1124 ontime 0.5
log com1 rtcm1084 ontime 0.5
log com1 rtcm1094 ontime 0.5
log com1 bestposb ontime 0.5
log com1 timeb ontime 1
saveconfig
```

## OEM718D

### RTK

Configure the airborne navigation board as follows

```bash
# Airborne board configuration
# Reset the board
freset
unlogall
interfacemode usb1 none none
interfacemode usb2 none none
interfacemode usb3 none none
eventincontrol mark1 disable
# Configure serial baud rate
serialconfig com1 230400
serialconfig com2 230400
# com1 configuration commands
log com1 bestposb ontime 0.1
log com1 dualantennaheadingb ontime 0.1
log com1 bestvelb ontime 0.1
log com1 psrdopb ontime 0.1
log com1 timeb ontime 1
rtkportmode com1 rtk
interfacemode com1 rtcmv3 novatel off
# com2 configuration commands
log com2 bestposb ontime 0.1
log com2 bestvelb ontime 0.1
log com2 dualantennaheadingb ontime 0.1
log com2 psrdopb ontime 0.1
log com2 timeb ontime 1
interfacemode com2 novatel novatel off
# Save configuration
saveconfig
# View configuration commands
log loglist
```

Configure the ground navigation board as follows

```bash
# Ground board configuration
# Reset the board
freset
# Connect serial port 1 (9600) and configure the baud rate (change it as needed)
serialconfig com1 230400
serialconfig com2 230400
# Save configuration
saveconfig
# Reopen serial port 1 (230400), then send the configuration commands
unlogall
interfacemode usb1 none none
interfacemode usb2 none none
interfacemode usb3 none none
eventincontrol mark1 disable
# com1 configuration commands
interfacemode com1 novatel novatel off
log com1 novatelxobs ontime 0.1
log com1 novatelxref ontime 0.1
# com2 configuration commands
interfacemode com2 none rtcmv3 off
log com2 bestvelb ontime 0.1
log com2 bestposb ontime 0.1
log com2 dualantennaheadingb ontime 0.1
log com2 timeb ontime 1

log com2 rtcm1075 ontime 0.5
log com2 rtcm1085 ontime 0.5
log com2 rtcm1125 ontime 0.5
log com2 rtcm1006 ontime 10
log com2 rtcm1033 ontime 10
# Save configuration
saveconfig
# View configuration commands
log loglist
```

### Moving Platform

Configure the airborne navigation board as follows

```bash
# Airborne board configuration
# Reset the board
freset
unlogall
interfacemode usb1 none none
interfacemode usb2 none none
interfacemode usb3 none none
eventincontrol mark1 disable
# Configure serial baud rate
serialconfig com1 230400
serialconfig com2 230400
# com1 configuration commands
log com1 bestposb ontime 0.1
log com1 dualantennaheadingb ontime 0.1
log com1 bestvelb ontime 0.1
log com1 psrdopb ontime 0.1
log com1 timeb ontime 1
rtkportmode com1 align
interfacemode com1 novatel novatel off
# com2 configuration commands
log com2 bestposb ontime 0.1
log com2 bestvelb ontime 0.1
log com2 dualantennaheadingb ontime 0.1
log com2 psrdopb ontime 0.1
log com2 alignbslnenub onnew
log com2 aligndopb onnew
log com2 timeb ontime 1
interfacemode com2 novatel novatel off
# Save configuration
saveconfig
# View configuration commands
log loglist
```

Configure the ground navigation board as follows

```bash
# Ground board configuration
# Reset the board
freset
# Connect serial port 1 (9600) and configure the baud rate (change it as needed)
serialconfig com2 230400
serialconfig com1 230400
# Save configuration
saveconfig
# Reopen serial port 1 (230400), then send the configuration commands
unlogall
interfacemode usb1 none none
interfacemode usb2 none none
interfacemode usb3 none none
eventincontrol mark1 disable
# com1 configuration commands
interfacemode com1 novatel novatel off
movingbasestation enable
log com1 novatelxobs ontime 0.1
log com1 novatelxref ontime 0.1
# com2 configuration commands
interfacemode com2 novatel novatel off
log com2 bestvelb ontime 0.1
log com2 bestposb ontime 0.1
log com2 dualantennaheadingb ontime 0.1
log com2 timeb ontime 1
# Save configuration
saveconfig
# View configuration commands
log loglist
```
