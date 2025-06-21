
流程图编辑器 v2.0 全平台终极指南
================================

一、Linux深度支持
----------------
1. 主流发行版安装命令：
   # Debian/Ubuntu
   curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs libgtk-3-0 libnotify-dev

   # RHEL/CentOS
   curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
   sudo yum install -y nodejs gtk3-devel

   # Arch Linux
   pacman -S nodejs npm gtk3

2. 国产OS特别配置：
   • 统信UOS：需启用开发者模式
   • 麒麟OS：运行前执行『export QT_QPA_PLATFORM=offscreen』

二、Windows完整方案
------------------
1. 三种安装方式：
   [1] EXE安装包（自动配置）：
       flow_editor_windows_2.0.exe /SILENT

   [2] 绿色免安装版：
       解压后运行bin\\flow_editor.bat

   [3] Chocolatey安装：
       choco install flow-editor

三、macOS全架构支持
-----------------
1. 通用二进制安装：
   hdiutil attach flow_editor_macos.dmg
   cp -R /Volumes/FlowEditor/FlowEditor.app /Applications

2. 终端启动命令：
   open -a FlowEditor --args --disable-gpu-sandbox

四、树莓派优化
-------------
1. 专用镜像刷写：
   sudo dd if=flow_editor_raspi.img of=/dev/mmcblk0 bs=4M

2. 性能调优：
   • 超频设置：
     arm_freq=2000
     gpu_freq=750
   • 内存分配：
     gpu_mem=320

五、问题诊断
----------
1. 各平台日志位置：
   Linux: ~/.config/FlowEditor/logs/
   Windows: %APPDATA%\\FlowEditor\\logs\\
   macOS: ~/Library/Logs/FlowEditor/

2. 核心检测命令：
   flow-check --platform-test

