# Failsafe Protection

Go to Autopilot Setup -> Safety Protection to configure the handling logic for common faults.

## Low Battery Protection

Low voltage protection has three levels, corresponding to the warning, critical and emergency battery levels, as shown below:

| No. | Level     | Battery level                      | Description                                    |
| --- | --------- | ---------------------------------- | ---------------------------------------------- |
| 1.  | Warning   | BAT_LOW_THR=15% (default 12%~40%)  | Alerts the user                                |
| 2.  | Critical  | BAT_CRIT_THR=7% (default 5%~10%)   | Below this level the UAV should return at once |
| 3.  | Emergency | BAT_EMERGEN_THR=5% (default 3%~7%) | Below this level the UAV should land at once   |

System protection is configured using the `COM_LOW_BAT_ACT` parameter, as shown below:

| No. | COM_LOW_BAT_ACT | Action                                             | Remarks         |
| --- | --------------- | -------------------------------------------------- | --------------- |
| 1.  | 0               | Warning                                            | Not recommended |
| 2.  | 1               | Return                                             |                 |
| 3.  | 2               | Land in place                                      |                 |
| 4.  | 3               | Return when critical, land in place when emergency |                 |

## RC Signal Loss Protection

RC signal loss protection only takes effect in manual modes such as Stabilized (Stab), Altitude (AltCtr) and Position (PosCtr); it does not apply to most automatic mission modes. It is mainly controlled by the following parameters:

- `COM_RC_LOSS_T`: sets the loss detection time, default 0.5 s;

- `NAV_RCL_ACT`: the action performed after loss is detected; commonly Hold mode, Land mode or Return Mode.

The protection logic for each mode is shown below:

| No. | NAV_RCL_ACT | Manual mode                                           | Automatic mode                     | Remarks |
| --- | ----------- | ----------------------------------------------------- | ---------------------------------- | ------- |
| 1.  | Hold        | Ground station alerts, UAV holds its current position | No response, continues the mission |         |
| 2.  | Return      | Ground station alerts, UAV starts to return           | No response, continues the mission |         |
| 3.  | Land        | Ground station alerts, UAV starts to land             | No response, continues the mission |         |

## Data Link Loss Protection

Data link loss protection only takes effect in automatic modes such as MISSION, LOITER and ORBIT. It is mainly set by the following two parameters:

- `COM_DL_LOSS_T`: sets the loss detection time, default 10 s.

- `NAV_DLL_ACT`: sets the protection action after loss, including Disabled, Hold mode, Land mode and Return Mode.

  The protection logic for each mode is shown below:

| No. | NAV_DLL_ACT | Manual mode | Automatic mode                                         | Remarks |
| --- | ----------- | ----------- | ------------------------------------------------------ | ------- |
| 1.  | None        | No response | No response                                            |         |
| 2.  | Hold        | No response | Ground station alerts, UAV holds position and altitude |         |
| 3.  | Return      | No response | Ground station alerts, UAV returns                     |         |
| 4.  | Land        | No response | Ground station alerts, UAV lands                       |         |

## GNSS Failure Protection

Once the satellite loss protection logic is triggered, the loiter altitude, throttle and roll angle can be configured.

The relevant parameters are shown below:

| No. | Parameter      | Description                                                            | Recommended value                                                  |
| --- | -------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1.  | NAV_GPSF_ACT   | 0: loiter and heading flight 1: always heading flight 2: always loiter | Must be set to 2 when no heading is available after satellite loss |
| 2.  | NAV_GPSF_R     | Fixed roll angle                                                       | 15 deg                                                             |
| 3.  | NAV_GPSF_P     | Fixed pitch angle                                                      | 0 deg                                                              |
| 4.  | NAV_GPSF_TR    | Fixed throttle (used when altitude and speed are invalid)              | 30%                                                                |
| 5.  | NAV_GPSF_ALT   | Loiter altitude (above 10001 means use the current altitude)           | 10001                                                              |
| 6.  | NAV_GPSF_ARSPD | Cruise speed (set to 0 to use the configured cruise speed)             | 0 m/s                                                              |

## Engine Failure Protection

Once the engine failure protection logic is triggered, the pitch angle and return altitude can be configured.

The relevant parameters are shown below:

| No. | Parameter     | Description                                  | Recommended value |
| --- | ------------- | -------------------------------------------- | ----------------- |
| 1.  | EF_APT_PITCH  | Commanded pitch angle                        | -5 deg            |
| 2.  | EF_ROLL_MAX   | Roll angle limit                             | 35 deg            |
| 3.  | EF_MC_ACC_RAD | Multirotor lead distance                     | 100 m             |
| 4.  | EF_RTN_ALT    | Return altitude                              | 60 m              |
| 5.  | EF_TRANS_ALT  | Fixed-wing to multirotor transition altitude | 50 m              |
| 6.  | EF_LOITER_RAD | Loiter radius                                | 150 m             |

## Geofence Protection

The UAV supports two forms of geofence:

1. A cylindrical fence, configured using the maximum horizontal distance (`GF_MAX_VER_DIST`) and maximum vertical distance (`GF_MAX_HOR_DIST`) parameters;

2. A circular or polygonal area composed of multiple coordinate points, edited on the mission planning screen.

Both forms can be active at the same time; touching any fence triggers the protection logic. Use the `GF_ACTION` parameter to set the mode switched to when protection is triggered. The available options are None, Warning, Hold mode, Land mode and Return Mode, with parameter values 0, 1, 2, 3 and 5 respectively.

Once geofence protection is triggered, the protection logic is as follows:

| No. | GF_ACTION | Manual mode                                           | Automatic mode                                        | Remarks |
| --- | --------- | ----------------------------------------------------- | ----------------------------------------------------- | ------- |
| 1.  | None      | No response                                           | No response                                           |         |
| 2.  | Warning   | Ground station alerts                                 | Ground station alerts                                 |         |
| 3.  | Hold      | Ground station alerts, UAV holds its current position | Ground station alerts, UAV holds its current position |         |
| 4.  | Return    | Ground station alerts, UAV starts to return           | Ground station alerts, UAV starts to return           |         |
| 5.  | Land      | Ground station alerts, UAV starts to land             | Ground station alerts, UAV starts to land             |         |
