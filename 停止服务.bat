@echo off
chcp 65001 >nul
echo 正在停止所有服务...
echo.

REM 停止所有 Node.js 进程
echo 正在停止 Node.js 进程...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [成功] 已停止所有 Node.js 进程
) else (
    echo [信息] 没有找到运行中的 Node.js 进程
)
echo.

REM 停止所有 npm 进程
echo 正在停止 npm 进程...
taskkill /F /IM npm.cmd >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [成功] 已停止所有 npm 进程
) else (
    echo [信息] 没有找到运行中的 npm 进程
)
echo.

echo ========================================
echo 所有服务已停止
echo ========================================
pause


