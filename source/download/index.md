# 资源下载

NextPilot导航飞控目前只支持NP-H05系列飞控，该飞控采用两块STM32H7的主控芯片，分别运行飞行控制程序和惯性导航程序，故我们提供了两个固件（飞控固件、导航固件），需要分别通过FCS-USB下载飞控固件、通过AHRS-USB下载导航固件。

> 注意：
>
> 由于两个主控芯片相同，很容易搞混，下载前一定要注意，根据固件类型选择对应的USB烧写！！！两个USB连接方式请参考产品说明。

## 飞控固件

根据使用场景选择固件，以下为最新版本固件（通过FCS-USB口烧录），历史固件请查看[发布记录](./changelog)。

- 真机飞行固件：[fcs-v4-default.bin](/firmware/fcs-v4-default.bin)

- 硬件在环固件HITL：[fcs-v4-default-hitl.bin](/firmware/fcs-v4-default-hitl.bin)

- 软件在环固件SITL：[sitl-qemu.bin](/firmware/sitl-qemu.bin)

## 导航固件

以下为最新版本固件（通过AHRS-USB口烧录），历史固件请查看[发布记录](./changelog)。

[ins-v4-default.bin](/firmware/ins-v4-default.bin)

## 地面站软件

### 百度网盘下载

通过网盘分享的文件：nextpilot-user-assets
链接: <https://pan.baidu.com/s/1-OiGOEX7B2mDmwkJNmagVg> 提取码: next

### SITL相关脚本 {#SITL相关脚本}

软件在环仿真相关脚本的使用请参考《软件在环仿真》。

- 软件在环仿真启动脚本（必须）：[start-qemu.bat](/scripts/start-qemu.bat)；
- 日志提取脚本（非必须）：[extract-sd.bat](/scripts/extract-sd.bat)；
