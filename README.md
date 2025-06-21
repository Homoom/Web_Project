
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
=== 基础必备 ===
1. Git版本控制
2. CMake ≥3.15
3. C++17兼容编译器
4. Qt5/Qt6运行时



   部署指南
=== Windows ===
• Visual Studio 2022 Build Tools
• 组件选择：
  - MSVC v143
  - Windows 10 SDK
• 可选：WiX Toolset（打包用）

=== macOS ===
brew install:
- git cmake llvm
- qt@5

=== Linux/树莓派 ===
sudo apt install:
- build-essential
- libgtk-3-dev 
- libboost-all-dev
- qtbase5-dev

=== 国产系统 ===
• 统信UOS：通过应用商店安装「开发工具套件」
• 麒麟OS：需启用「安全软件源」后安装kylin-build-env

=== 验证命令 ===
cmake --version  # ≥3.15
g++ --version    # 支持-std=c++17
qmake -v         # Qt5/6版本检测

=== 插件开发扩展包 ===

◆ 基础SDK（所有插件必须）
- Protocol Buffers 3.0+
- JSON Schema验证器
- 签名工具：openssl或gnupg

◆ Python插件
pip install：
- cffi≥1.15
- typeguard（类型检查）
- 开发工具包：dev_kit_py.tar.gz（项目提供）

◆ C++插件
需额外安装：
- CLangd语言服务器
- vcpkg集成：
  vcpkg install cpp-plugin-sdk

◆ WebAssembly插件
emsdk环境：
- 安装：./emsdk install 3.1.44
- 激活：./emsdk activate --embedded

◆ 调试工具
所有平台通用：
- Wireshark（协议分析）
- Frida（动态插桩）
- 项目提供的debug_launcher

=== 进阶开发配置 ===

◆ IDE推荐组合
- Python: VSCode + Pylance + 项目专用snippets插件
- C++: CLion + 预配置的CMake模板
- WASM: 官方Emscripten插件 + Memory Profiler

◆ 国产系统特别配置
1. 统信UOS：
   - 需手动编译protobuf-cpp-3.21.12
   - 插件签名必须使用SM2算法
2. 麒麟OS：
   - 在/etc/ld.so.conf添加/opt/kylin_dev_lib路径
   - 使用kylin-certmgr进行代码签名

◆ 插件发布流程
1. 开发阶段：
   export PLUGIN_MODE=debug
   ./build --with-test
2. 签名阶段：
   openssl smime -sign -in plugin.zip -out signed.zip \
   -signer cert.pem -inkey key.pem -binary
3. 发布检查：
   ./validate --abi-check --security-scan
====================
Windows平台部署方案
====================
[原有内容保持不变...]

■ 错误排查：
1. MSVC编译器错误：
   - 症状：C1083无法打开包含文件
   - 解决：运行 vcvarsall.bat x64

2. Qt链接错误：
   - 症状：LNK2019未解析符号
   - 解决：设置QTDIR环境变量

■ 性能优化：
   set CL=/MP /O2 /GL
   set LINK=/LTCG

■ 多语言支持：
   - 安装语言包：winget install Microsoft.LanguageExperiencePackzh-CN
   - 编译时添加：-DCMAKE_TRANSLATIONS_DIR=%CD%/translations

====================
macOS平台部署方案
====================
[原有内容保持不变...]

■ 错误排查：
1. 签名错误：
   - 症状："app is damaged"
   - 解决：xattr -cr /Applications/flow-editor.app

2. 权限错误：
   - 症状：dyld: Library not loaded
   - 解决：brew link --overwrite qt@5

■ 性能优化：
   export CXXFLAGS="-O3 -march=native"
   export LDFLAGS="-Wl,-dead_strip"

■ 多语言支持：
   - 生成翻译：lupdate flow-editor.pro
   - 编译翻译：lrelease zh_CN.ts

====================
[其他平台类似补充...]

====================
Docker高级配置
====================
■ 多语言支持：
   Dockerfile添加：
   RUN apt install -y locales
   RUN sed -i '/zh_CN.UTF-8/s/^# //' /etc/locale.gen
   RUN locale-gen

■ GPU加速方案：
   1. 安装NVIDIA容器工具包
   2. 运行参数添加：
      --gpus all -e NVIDIA_DRIVER_CAPABILITIES=all

■ 性能监控：
   docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

====================
通用错误代码表
====================
| 代码  | 含义                  | 解决方案               |
|-------|-----------------------|-----------------------|
| 0x801 | 缺少Qt依赖            | 安装qt5-translations  |
| 0x802 | 图形驱动不兼容        | 更新显卡驱动          |
| 0x803 | 中文路径识别失败      | 设置LC_ALL=zh_CN.UTF8 |
