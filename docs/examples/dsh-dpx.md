# dsh-dpx：dsh-distribution 的标准管理范例

> **范例，不是标准。** `dsh-dpx` 是 [`dsh-distribution`](../../vendor/meta-protocols/dsh-distribution)
> 的一个真实使用者，本仓库把它作为该协议的**标准管理范例**收录：读它可以最快地
> 理解“一个 DSH 环境如何向外部世界说明自己”。它不定义协议，也不是唯一的管理器，
> 更不代表被它管理的环境因此安全。

- 上游仓库：[T-Auto/dsh-dpx](https://github.com/T-Auto/dsh-dpx)
- 挂载位置：[`vendor/examples/dsh-dpx`](../../vendor/examples/dsh-dpx)
- 索引条目：[`registry/implementations.json`](../../registry/implementations.json)（`role: standard-management-example`）
- 遵循协议：[`dsh-distribution`](../../vendor/meta-protocols/dsh-distribution)（环境身份与可迁移性）
- 上游自称状态：实验性、Windows 优先，需要 Node.js `>=22.19.0`

## 1. 它是什么

`dsh-dpx` 是一个**多环境 DSH 包管理器 / 环境管理器**：在一台电脑上创建、安装、
发现和启动多个彼此隔离的 DSH 环境（例如 `test`、`stable`、`alpha`），每个环境
拥有独立的 npm 全局前缀、下载缓存、`DSH_HOME`、agents/skills 目录、工作目录与
环境描述符。安装到 `test` 不会改动全局 DSH，也不会影响 `stable`。

它服务于两个目标：

1. **开发与调试**：同一台机器保留多个不同版本的 DSH / TUI / 第三方包环境，互不污染，
   便于复现和比较问题；
2. **第三方整合包共存**：整合包按 `dsh-distribution` 的环境身份与发现规则注册实例，
   其他兼容工具不扫盘也能找到它。

它**不是** DSH 插件，不修改 DSH 内核，也不修改 `dsh-std` 或 `dsh-distribution` 的语义。

## 2. 为什么它是“标准管理范例”

`dsh-distribution` 要解决的是：一个完整可运行的 DSH 环境，怎么被外部世界识别、
发现和管理。`dsh-dpx` 把这件事完整走通了一遍，三块协议能力都有真实落地：

| `dsh-distribution` 的能力 | `dsh-dpx` 的落地方式 |
| --- | --- |
| **环境身份**（DistributionDescriptor） | 每个环境根生成 `dsh-distribution.json`，声明 `DistributionDescriptor`、`ManagedLayout`、`EnvironmentDiscovery` |
| **安装实例身份**（EnvironmentInstance） | 每次安装生成独立的 `urn:uuid:` 实例 ID，因此同一发行物的 `test` 与 `stable` 绝不会被认作同一份安装 |
| **受控布局**（ManagedLayout） | 环境根下固定子路径：`npm-prefix`、`npm-cache`、`dsh-home`、`agents-home`、`home`、`workspace`、`desktop` 等，逐项声明归属 |
| **发现**（EnvironmentDiscovery） | 原子维护自己的 `registry.json`；Windows 上再写一个无执行权限的 discovery pointer（`HKCU\Software\DSH\DPX`） |
| **本地记录**（DiscoverableEntry 形状） | 环境根 `.dpx-environment.json` 保存实例与发现记录 |

值得注意的两个示范细节：

- **协议不规定物理位置。** `HKCU\Software\DSH\DPX` 是 `dsh-dpx` 自己的
  `dpx.dsh.dev/v1alpha1` 实现 profile，不是通用协议强制的注册位置；默认 registry 在
  `%LOCALAPPDATA%\DSH\DPX\registry.json`，可用 `DPX_HOME` 改。
- **不越界。** `dsh-dpx` 明确不写 `HKCU\Software\DSH\EnvironmentInstallations`——
  那是另一个固定发行环境安装器（`dsh-distribution-manager`）的验证/导入边界，
  混用会破坏对方的信任模型。这是“多管理器共存”最实际的一条纪律。

## 3. 一次真实用法

```bash
# 首次创建名为 test 的环境（--no-desktop 可跳过 Windows 桌面端 EXE）
dpx npm install -g @deepseek-ai/dsh @deepseek-harness-tui/dsh-tui --test --"D:\DevEnvs\Projects"

# 环境已存在时不再需要存储目录
dpx npm install -g @deepseek-ai/dsh@latest --test

# 启动该环境内的 TUI / Web UI
dpx run --test dsh-tui
dpx run --test dsh web --no-open

# 查看注册与协议描述
dpx env list
dpx env show --test
dpx descriptor --test

# 注销（保留文件） / 注销并删除受控环境根
dpx env remove --test
dpx env remove --test --purge
```

创建出的环境根形状（Windows 首次创建时含桌面端 EXE）：

```text
<父目录>\dsh-environments\test\
├── npm-prefix\  npm-cache\  dsh-home\  agents-home\  home\  appdata\  localappdata\  tmp\
├── workspace\
├── desktop\DSH DeepSeek Harness Desktop.exe
├── dsh-distribution.json        # 环境描述符（协议侧）
└── .dpx-environment.json        # 实例身份与本地发现记录
```

每次 `dpx run` 会为子进程设置环境专属绝对路径（`DSH_HOME`、`DSH_AGENTS_HOME`、
`NPM_CONFIG_PREFIX`、`NPM_CONFIG_CACHE`、`HOME`/`USERPROFILE`/`APPDATA`/`LOCALAPPDATA`/`TEMP`），
并清除可能污染环境的 `NODE_OPTIONS`、`NODE_PATH` 与常见代理变量。

## 4. 它刻意不做什么

- **不是协议本身**：`dsh-distribution` 的语义由该协议仓库定义，`dsh-dpx` 只是使用者；
- **不是唯一管理器**：其他工具可以按同一份描述管理同一个环境；`dsh-dpx` 只负责自己
  registry 里登记的记录；
- **不做沙箱**：目录隔离只是隔离，npm 生命周期脚本仍以当前用户权限运行，不能把
  不可信包当作安全执行环境；
- **不扫盘、不猜测**：registry 损坏、重名、实例冲突或环境根缺失时**失败关闭**，
  不自动重建或接管目录；
- **不自动走代理**：`dpx npm install` 默认显式 `--proxy=null --https-proxy=null`
  覆盖用户 npmrc；需要代理时由调用者在当次命令里写明；
- **不替别的工具做决定**：不写他人的注册位置，也不执行 registry 提供的任意命令。

## 5. 怎么复算它的验证结果

范例的价值在于**可复算**。`dsh-dpx` 自己的验证：

```powershell
npm test           # 只用临时目录与 fake npm，不下载上游包、不启动真实 DSH
npm run check
npm run pack:check
```

用 `dsh-distribution` 的 conformance CLI 校验它生成的环境描述符：

```powershell
node ..\dsh-distribution\packages\conformance\lib\cli.js "$PWD\dsh-distribution.json"
```

> 格式校验通过**不等于**数据安全认证；密码、密钥不要写进描述符。
> 现有工具能否读取或操作这些信息，取决于具体工具的适配情况。

## 6. 如果我要按 dsh-distribution 管理自己的环境

照这个范例抄的是**做法**，不是目录名：

1. 生成一份符合协议的环境描述符（`DistributionDescriptor` + `ManagedLayout` +
   可选 `EnvironmentDiscovery`）；
2. 为每次安装生成独立的实例身份，不要用发行版本号代替安装身份；
3. 说清哪些资源属于本环境、哪些是共享的，为管理工具划分边界提供依据；
4. 用协议允许的受限相对路径语法声明资源位置（含空格的 EXE 文件名不能作为资源位置，
   所以 `dsh-dpx` 把 `./desktop` 声明为 DPX 专属桌面启动器目录）；
5. 如实声明尚未实现的能力，不编造功能；迁移与恢复能力由管理器自己实现并说明；
6. 用 conformance CLI 自查，再把结果作为**证据**提供，而不是自我认证。

## 7. 相关文档

- 协议本体：[`dsh-distribution` 接入指南](../../vendor/meta-protocols/dsh-distribution/docs/getting-started.md)
- 协议架构：[`dsh-distribution` 架构说明](../../vendor/meta-protocols/dsh-distribution/docs/architecture.md)
- 一致性测试：[`dsh-distribution` conformance](../../vendor/meta-protocols/dsh-distribution/conformance/README.md)
- 生态总览：[`docs/overview.md`](../overview.md)
- 目录规范：[`docs/directory-guide.md`](../directory-guide.md)
