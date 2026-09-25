# Parameter Reference

NextPilot references the PX4 parameter management module; most parameter names and functions are the same. Newly added parameters and frequently used parameters are listed below:

## Takeoff

| Parameter        | Description                 |
| ---------------- | --------------------------- |
| TMB_TKO          | Takeoff method              |
| COM_TAKEOFF_ACT  | Action after takeoff        |
| MIS_TAKEOFF_ALT  | Takeoff altitude            |
| MPC_Z_VEL_MAX_UP | Maximum vertical climb rate |

## Mission

| Parameter    | Description                                       |
| ------------ | ------------------------------------------------- |
| MIS_DIST_1WP | Maximum distance from takeoff to the 1st waypoint |
| MIS_DIST_WPS | Maximum distance between waypoints                |
| MIS_YAW_ERR  | Acceptable heading error                          |

## Fixed-Wing

| Parameter       | Description                   |
| --------------- | ----------------------------- |
| FW_AIRSPD_TRIM  | Cruise airspeed               |
| FW_AIRSPD_MIN   | Minimum cruise airspeed limit |
| FW_AIRSPD_MAX   | Maximum cruise airspeed limit |
| FW_AIRSPD_STALL | Stall airspeed                |
| FW_THR_CRUISE   | Cruise throttle               |
| FW_THR_MIN      | Minimum throttle limit        |
| FW_THR_MAX      | Maximum throttle limit        |
| FW_L1_PERIOD    | Turn lead coefficient         |
| NAV_FW_ACC_RAD  | Turn lead distance            |
| FW_P_LIM_MIN    | Minimum pitch angle limit     |
| FW_P_LIM_MAX    | Maximum pitch angle limit     |
| FW_R_LIM        | Roll angle limit              |
| FW_T_CLMB_MAX   | Maximum climb rate limit      |
| FW_T_CLMB_R_SP  | Climb rate setpoint           |
| FW_T_SINK_MIN   | Minimum descent rate limit    |
| FW_T_SINK_MAX   | Maximum descent rate limit    |
| FW_T_SINK_R_SP  | Descent rate setpoint         |
| NAV_LOITER_RAD  | Fixed-wing loiter radius      |

## Multirotor

| Parameter        | Description                     |
| ---------------- | ------------------------------- |
| MPC_XY_CRUISE    | Cruise speed                    |
| MPC_Z_VEL_MAX_UP | Maximum vertical climb rate     |
| MPC_Z_VEL_MAX_DN | Maximum vertical descent rate   |
| MPC_LAND_SPEED   | Multirotor landing speed        |
| MPC_XY_VEL_MAX   | Maximum horizontal flight speed |
| MPC_VEL_MANUAL   | Maximum speed in manual mode    |

## Transition

| Parameter        | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| VT_F_TRANS_THR   | Forward transition throttle (multirotor to fixed-wing)         |
| VT_PSHER_RMP_DT  | Throttle ramp time                                             |
| VT_TRANS_MIN_TM  | Minimum blending time                                          |
| VT_ARSP_BLEND    | Blending airspeed (transition speed must exceed it)            |
| VT_ARSP_TRANS    | Transition airspeed                                            |
| FW_PSP_OFF       | Fixed-wing pitch command                                       |
| VT_TRANS_TIMEOUT | Forward transition time limit                                  |
| VT_B_REV_DEL     | Back transition delay (fixed-wing to multirotor)               |
| VT_B_TRANS_THR   | Back transition throttle                                       |
| VT_B_TRANS_RAMP  | Back transition blending time                                  |
| VT_B_TRANS_DUR   | Back transition time limit                                     |
| VT_TYPE          | UAV type                                                       |
| VT_FW_MIN_ALT    | Minimum fixed-wing flight altitude (relative to takeoff point) |
| VT_FW_QC_P       | Fixed-wing pitch angle limit                                   |
| VT_FW_QC_R       | Fixed-wing roll angle limit                                    |

## Navigation

| Parameter      | Description                     |
| -------------- | ------------------------------- |
| NAV_ACC_RAD    | Horizontal lead distance        |
| NAV_FW_ACC_RAD | Fixed-wing horizontal turn lead |
| NAV_LOITER_RAD | Loiter radius                   |
| NAV_MC_ALT_RAD | Multirotor altitude lead        |
| NAV_FW_ALT_RAD | Fixed-wing altitude lead        |

## Moving Platform

| Parameter        | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| TMB_TKO          | Moving platform takeoff                                    |
| RTL_TYPE         | Return type                                                |
| MPC_XY_CRUISE    | Multirotor cruise speed (must exceed platform speed)       |
| RMB_FAF_ALT      | Moving platform return altitude                            |
| RMB_APPR_DIR     | Moving platform approach direction                         |
| RMB_APPR_HDG     | Moving platform approach heading                           |
| RMB_FAF_DIST     | Approach distance                                          |
| RMB_RTN_ALT      | Approach altitude                                          |
| RMB_RTN_ALT_MIN  | Minimum approach altitude                                  |
| VT_FW_MIN_ALT    | Minimum fixed-wing flight altitude                         |
| RMB_TRANS_B_SLD  | Fixed-wing deceleration distance                           |
| RMB_TRANS_B_DIST | Fixed-wing to multirotor transition distance               |
| RMB_LOITER_RAD   | Moving platform loiter radius                              |
| RMB_PROHBT_RAD   | Moving platform protection radius                          |
| RMB_MC_ACC_RAD   | Multirotor waypoint lead distance                          |
| RMB_MC_FLT_MAX   | Maximum multirotor flight distance                         |
| RMB_MC_SLD       | Multirotor deceleration distance                           |
| RMB_FS_TGT_LT    | Relative position loss time threshold                      |
| RMB_FS_ACT       | Relative position loss protection action                   |
| RMB_FS_LOIT_RAD  | Loiter radius after relative position loss                 |
| RMB_FS_LOIT_ALT  | Loiter altitude after relative position loss               |
| RMB_FS_APT_LAT   | Designated loiter latitude after relative position loss    |
| RMB_FS_APT_LON   | Designated loiter longitude after relative position loss   |
| TMB_SLD_PCT      | Moving platform takeoff deceleration percentage            |
| TMB_SLD_ALT      | Moving platform takeoff deceleration relative altitude     |
| LNDMC_XY_VEL_MAX | Multirotor landing speed threshold                         |
| LNDFW_AIRSPD_MAX | Fixed-wing landing airspeed threshold                      |
| RMB_OFFSET_HDG   | Heading offset between the base station and the vessel     |
| RMB_DX           | Landing point distance from the base station on the X axis |
| RMB_DY           | Landing point distance from the base station on the Y axis |
| RMB_DZ           | Landing point distance from the base station on the Z axis |

## Return

| Parameter       | Description                                    |
| --------------- | ---------------------------------------------- |
| RTL_TYPE        | Return type                                    |
| MPC_XY_CRUISE   | Multirotor cruise speed                        |
| RTL_LOITER_RAD  | Return loiter radius                           |
| RTL_DESCEND_ALT | Descent altitude                               |
| RTL_RETURN_ALT  | Return altitude                                |
| RTL_LND_HEADING | Align to the original heading when landing     |
| NAV_VT_DIST_SLD | Fixed-wing to rotor deceleration lead distance |
| COM_DISARM_LAND | Lock wait time after landing                   |

## Engine

| Parameter          | Description                  |
| ------------------ | ---------------------------- |
| ENGINE_TYPE        | Engine type                  |
| PWM_MAIN_REV5      | Throttle channel reversal    |
| ENGINE_PWM_MIN     | Minimum engine throttle PWM  |
| ENGINE_PWM_OFF     | Engine cutoff throttle PWM   |
| ENGINE_TEMP_MIN    | Minimum cylinder temperature |
| ENGINE_TEMP_MAX    | Maximum cylinder temperature |
| ENGINE_FUEL_AMOUNT | Takeoff fuel amount          |

## RC and Telemetry Channels

| Parameter      | Description                           |
| -------------- | ------------------------------------- |
| MAV_0_PROTOCOL | Channel 0: interface protocol         |
| MAV_0_MODE     | Channel 0: communication mode         |
| MAV_0_LU       | Channel 0: link selection             |
| MAV_0_RATE     | Channel 0: maximum communication rate |
| MAV_0_FORWARD  | Channel 0: forwarding setting         |
| MAV_0_CONFIG   | Channel 0: serial port selection      |
| MAV_0_BAUD     | Channel 0: serial baud rate           |
| MAV_0_RMT_IP   | Channel 0: UDP remote IP              |
| MAV_0_LOC_PORT | Channel 0: UDP local port             |
| MAV_0_RMT_PORT | Channel 0: UDP remote port            |
| MAV_1_PROTOCOL | Channel 1: interface protocol         |
| MAV_1_MODE     | Channel 1: communication mode         |
| MAV_1_LU       | Channel 1: link selection             |
| MAV_1_RATE     | Channel 1: maximum communication rate |
| MAV_1_FORWARD  | Channel 1: forwarding setting         |
| MAV_1_CONFIG   | Channel 1: serial port selection      |
| MAV_1_BAUD     | Channel 1: serial baud rate           |
| MAV_1_RMT_IP   | Channel 1: UDP remote IP              |
| MAV_1_LOC_PORT | Channel 1: UDP local port             |
| MAV_1_RMT_PORT | Channel 1: UDP remote port            |
| MAV_2_PROTOCOL | Channel 2: interface protocol         |
| MAV_2_MODE     | Channel 2: communication mode         |
| MAV_2_LU       | Channel 2: link selection             |
| MAV_2_RATE     | Channel 2: maximum communication rate |
| MAV_2_FORWARD  | Channel 2: forwarding setting         |
| MAV_2_CONFIG   | Channel 2: serial port selection      |
| MAV_2_BAUD     | Channel 2: serial baud rate           |
| MAV_2_RMT_IP   | Channel 2: UDP remote IP              |
| MAV_2_LOC_PORT | Channel 2: UDP local port             |
| MAV_2_RMT_PORT | Channel 2: UDP remote port            |
| MAV_3_PROTOCOL | Channel 3: interface protocol         |
| MAV_3_MODE     | Channel 3: communication mode         |
| MAV_3_LU       | Channel 3: link selection             |
| MAV_3_RATE     | Channel 3: maximum communication rate |
| MAV_3_FORWARD  | Channel 3: forwarding setting         |
| MAV_3_CONFIG   | Channel 3: serial port selection      |
| MAV_3_BAUD     | Channel 3: serial baud rate           |
| MAV_3_RMT_IP   | Channel 3: UDP remote IP              |
| MAV_3_LOC_PORT | Channel 3: UDP local port             |
| MAV_3_RMT_PORT | Channel 3: UDP remote port            |

---

## Safety Protection Parameters

### Low Battery Protection

| Parameter       | Description             |
| --------------- | ----------------------- |
| COM_LOW_BAT_ACT | Failsafe action         |
| BAT_LOW_THR     | Battery warning level   |
| BAT_CRIT_THR    | Battery failsafe level  |
| BAT_EMERGEN_THR | Battery emergency level |

### RC Protection

| Parameter       | Description                                   |
| --------------- | --------------------------------------------- |
| COM_RC_LOSS_T   | Loss time threshold                           |
| COM_RCL_ACT_T   | Delay before executing NAV_RCL_ACT after loss |
| NAV_RCL_ACT     | Action executed after loss                    |
| COM_RCL_EXCEPT  | Modes that ignore RC loss                     |
| COM_RC_OVERRIDE | Stick override flag                           |
| COM_RC_STICK_OV | Stick override percentage                     |

### Data Link Loss Protection

| Parameter     | Description                  |
| ------------- | ---------------------------- |
| COM_DL_LOSS_T | Loss time threshold          |
| NAV_DLL_ACT   | Protection action to execute |

### Geofence Protection

| Parameter       | Description                                      |
| --------------- | ------------------------------------------------ |
| GF_ACTION       | Action executed when the geofence is triggered   |
| GF_COUNT        | Fence count limit (-1 means unlimited)           |
| GF_MAX_HOR_DIST | Maximum horizontal distance (from takeoff point) |
| GF_MAX_VER_DIST | Maximum altitude (from takeoff point)            |

### GNSS Loss Protection

| Parameter      | Description                                             |
| -------------- | ------------------------------------------------------- |
| NAV_GPSF_ACT   | Action executed after GNSS loss                         |
| NAV_GPSF_CL    | When NAV_GPSF_ACT is 0, prefer loiter or heading flight |
| NAV_GPSF_COGS  | Heading flight heading selection                        |
| NAV_GPSF_COGT  | Heading flight duration                                 |
| NAV_GPSF_HDG   | Heading flight track angle                              |
| NAV_GPSF_LT    | Loiter time                                             |
| NAV_GPSF_R     | Loiter specified roll angle                             |
| NAV_GPSF_P     | Loiter specified pitch angle                            |
| NAV_GPSF_TR    | Loiter specified throttle                               |
| NAV_GPSF_ALT   | Loiter altitude                                         |
| NAV_GPSF_ARSPD | Cruise airspeed                                         |

### Engine Failure Protection

| Parameter       | Description                       |
| --------------- | --------------------------------- |
| EF_APT_PITCH    | Commanded pitch angle             |
| EF_ROLL_MAX     | Roll angle limit                  |
| EF_MC_ACC_RAD   | Multirotor lead distance          |
| EF_RTN_ALT      | Return altitude                   |
| EF_TRANS_ALT    | Fixed-wing to multirotor altitude |
| EF_LOITER_RAD   | Loiter radius                     |
| EF_MB_LOIT_ALT  | Loiter altitude                   |
| EF_MB_FAF_DIST  | Approach distance                 |
| EF_MB_APPR_DIR  | Approach direction                |
| EF_MB_APPR_HDG  | Approach heading                  |
| ENGINE_TEMP_MIN | Minimum cylinder temperature      |
| ENGINE_TEMP_MAX | Maximum cylinder temperature      |

### Formation Protection

| Parameter      | Description                 |
| -------------- | --------------------------- |
| NAV_FTW_MRALT  | Minimum altitude separation |
| NAV_FT_VTYPE   | Formation shape             |
| NAV_FTW_L_ACT  | Leader loss action          |
| COM_FTW_LOSS_T | Leader loss time            |
