@echo off

set zip="C:\Program Files\7-Zip\7z.exe"

if exist %zip% (
	goto run
) else (
	echo "Error: Cannot found C:\Program Files\7-Zip\7z.exe, please install 7z.exe first."
    pause
)

:run
%zip% x "sd.bin" -o"./sd"
