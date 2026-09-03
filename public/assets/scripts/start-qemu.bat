@echo off
if exist sd.bin goto run
qemu-img create -f raw sd.bin 256M
:run
qemu-system-arm -M vexpress-a9 -kernel sitl-qemu.bin -display none -serial stdio -sd sd.bin
REM -net nic -net tap,ifname=tap
