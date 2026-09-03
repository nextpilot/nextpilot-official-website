# 地面站连接

## 连接方式

NextPilot 地面站支持串口、UDP 单播、UDP 组播、TCP、日志、视频等设备的连接。

如果需要连接飞控硬件，则需要使用带串口的数据链连接飞控 RS422-1（该串口是飞控默认通信串口），地面站通过串口/网口与数据链连接。

> 数据链可选择市面上常见的数传、图传（带网口或串口）即可。

如果需要连接仿真飞控，则根据仿真主机 IP 在地面站创建 UDP 连接即可。

## 设备连接

### 打开界面

点击地面站左侧侧栏常规区域下`设备连接`，或点击地面站左上角主菜单选择设备连接，即可打开设备连接界面。如下图所示：

<img src="/assets/images/manual/gcs-device-connection.png" alt="gcs-device-connection" loading="lazy" />

### 自动连接 UDP

勾选设备连接界面左下角`自动连接UDP`即可监听本地 UDP 指定端口，一旦监听到该端口有无人机通信数据即可自动创建通信连接。这种连接方式一般用于数据链支持网络通信以及进行飞控仿真情况。

### 添加连接

通过点击“添加”按钮，创建串口、UDP、TCP 等新的通信连接，输入名称、选择协议、选择接口，根据接口类型输入连接配置即可。

**串口连接**

串口连接一般在调试时使用较多，插入串口转 USB 至计算机后，即可选择串口设备，并且设置波特率。

<img src="/assets/images/manual/gcs-connect-serial.png" alt="gcs-connect-serial" loading="lazy" />

**UDP 连接**

UDP 连接是实际产品中应用最广泛的连接接口，一般只需要设置本地地址和本地端口即可，地面站会自动创建本地网络服务器，等待接收任何发往本地端口的数据并创建连接。如下图所示：

<img src="/assets/images/manual/gcs-connect-udp.png" alt="gcs-connect-udp" loading="lazy" />

如果需要连接的指定无人机，则一般需要设置组播地址、本地端口、目的端口。如下图所示：

<img src="/assets/images/manual/gcs-connect-udp-multicast.png" alt="gcs-connect-udp-multicast" loading="lazy" />

### 连接列表

所有已创建的通信连接在界面左侧显示。

<img src="/assets/images/manual/gcs-connection-list.png" alt="gcs-connection-list" loading="lazy" />

## 开启连接

在已创建的通信连接列表中，点击并选择，然后点击“连接”按钮即可打开通信连接，正常连接后，对应的连接实例显示绿色圆圈。

如果需要连接多架无人机，可以依次选择并打开多个通信连接，地面站会根据无人机 ID 创建多个实例并显示在主界面。
