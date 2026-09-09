<p align="center">
  <img src="docs/assets/logo_f.svg" alt="dsh-ecosystem-spec - DSH Community Ecosystem Interoperability Specification" width="560">
</p>

<p align="center">
  <a href="https://github.com/T-Auto/dsh-ecosystem-spec/actions/workflows/ci.yml">
    <img alt="CI" src="https://img.shields.io/github/actions/workflow/status/T-Auto/dsh-ecosystem-spec/ci.yml?branch=main&style=flat">
  </a>
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-2e8b57?style=flat">
  <img alt="GitHub Stars" src="https://img.shields.io/github/stars/T-Auto/dsh-ecosystem-spec?style=flat&color=eab308">
  <img alt="GitHub Forks" src="https://img.shields.io/github/forks/T-Auto/dsh-ecosystem-spec?style=flat&color=8b5cf6">
</p>

# dsh-ecosystem-spec

> **DSH Community Ecosystem Interoperability Specification**  
> 社区插件互操作规范实验库

※本文档正在修订中：协议正文以 [`vendor/`](vendor/README.md) 挂载的上游仓库为准；
重构前的 TUI 时代内容（准入规范、conformance、registry contracts、adapters、RFC 等）
已移出工作树，恢复路径见 [`decisions/0001-remove-legacy-archive.md`](decisions/0001-remove-legacy-archive.md)。

## 这是什么项目？

这是由[dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI)团队和[DSH-Desktop-EAC](https://github.com/zouyuxuan122/DSH-Desktop-EAC)团队联合发起的社区协议，提供一套可选、可验证的互操作共识。有详细文档、验证自动化流程及**开包即用的skill**。当不同的 DSH 项目希望互相理解、发现、协作或被共同管理时，本项目将提供一套稳定的共同语言，同时带来全方位的工程解耦红利：让上游演进更自由，让生态插件更稳定，让跨端运行零成本，让开发体验更舒适，让激进的想法都可以不受制约的落地。本规范并非官方标准，但我们希望通过此尝试，为碎片化的dsh生态，接起插件对话的桥梁。

> 如果你没看懂，那可以理解为：
>
> 如果你做插件，希望你的插件和其他插件一起装的时候兼容性更好，本项目里有你的插件【告诉其他插件你的版本号，你适配了什么版本的dsh，你有什么兼容性需求/怎么被其他插件操作/怎么操作其他插件】的标准格式
>
> 如果你做dsh整合包，本项目也提供了【像python安装时勾选的“add to path”那样的标准路径格式】，向系统和其他整合包管理器告知你的.dsh用户文件存哪了，以及你的功能是什么，有什么需要注意的，为一个电脑可以多个dsh整合包共存奠定基础
>
> 以及一些代码**工程规范**、**工程纪律**或者**解耦性要求**。规范的，解耦的代码互相兼容当然更容易；和dsh上游api做了解耦的代码，适配版本变动当然也更容易更轻松；以及其他的兼容性和工程红利
>
> 关于**解耦性要求**，成熟的项目一定不会在代码里到处import上游包，这样上游更新的时候一大堆文件都得翻找并重写，解耦的做法是找个地方集中管理，这样其他部分的代码就不用动了。假如你不想每次都自己适配，你可以白嫖其他人做的集中管理层来适配新版本，比如用[dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI)的

dsh-ecosystem-spec 收录了插件元协议[dsh-std](https://github.com/Yan-Zero/dsh-std)、运行环境元协议[dsh-distribution](https://github.com/T-Auto/dsh-distribution)及相关子协议，前者面向插件作者，后者面向dsh发行版/整合包开发者。在元协议的框架下，**“协议本身”也变成了可拔插的插件——这和dsh本体的理念不谋而合。**

dsh-ecosystem-spec 相关协议干扰任何dsh插件的复杂功能实现，不影响dsh本体演进，鼓励对新形态插件和应用的探索。

dsh-ecosystem-spec 相关协议欢迎任何dsh开发者发起issue讨论或pr。对dsh-ecosystem-spec相关生态可以在本仓库讨论，对本仓库收录的具体协议可以到对应仓库留言或发起pr。

## 仓库结构：生态入口

本仓库是生态**入口**，不是协议正文的副本：协议与范例实现都用 git submodule
**挂载**在 [`vendor/`](vendor/README.md) 下并固定到具体 revision，本仓库只负责
索引、说明、校验与治理。

```text
dsh-ecosystem-spec/
├── README.md / CONTRIBUTING.md / SECURITY.md / LICENSE
├── docs/            说明文档：总览、目录规范、范例说明
├── governance/      治理：权威归属、状态词、挂载纪律
├── decisions/       决策记录（ADR）
├── registry/        机器可读索引：协议 / 范例 / Profile
├── profiles/        产品准入 Profile（只约束自己声明的生态范围）
├── vendor/          挂载区（git submodule）
│   ├── meta-protocols/   dsh-std、dsh-distribution
│   ├── sub-protocols/    子协议（预留：皮肤 / UI 插件协议等）
│   └── examples/         范例实现（dsh-dpx）
├── scripts/         本仓库自己的校验脚本
└── .github/         本仓库自己的 CI
```

| 类别 | 条目 | 状态（照录上游） | 挂载 | 说明 |
| --- | --- | --- | --- | --- |
| 元协议 | dsh-std | Draft | [`vendor/meta-protocols/dsh-std`](vendor/meta-protocols/dsh-std) | 插件 / 宿主 / 运行时互操作 |
| 元协议 | dsh-distribution | Draft | [`vendor/meta-protocols/dsh-distribution`](vendor/meta-protocols/dsh-distribution) | DSH 环境的身份与可迁移性 |
| 范例实现 | dsh-dpx | Experimental | [`vendor/examples/dsh-dpx`](vendor/examples/dsh-dpx) | dsh-distribution 的标准管理范例 |

- 想知道**以后新协议 / 新范例该放哪**：[`docs/directory-guide.md`](docs/directory-guide.md)
- 想看**机器可读索引**：[`registry/README.md`](registry/README.md)
- 想理解**四层模型**：[`docs/overview.md`](docs/overview.md)

每次提交，本仓库自己的 CI 都会校验“目录规范 ↔ 索引 ↔ 挂载 ↔ 文档链接”四者一致
（[`.github/workflows/ci.yml`](.github/workflows/ci.yml)）。

## 目录

- [仓库结构：生态入口](#仓库结构生态入口)
- [dsh-std：deepseek-harnessc插件规范](#dsh-std)
  - [dsh-std是什么？](#dsh-std是什么)
  - [采取dsh-std有什么好处？](#采取dsh-std有什么好处)
- [dsh-distribution：deepseek harness整合包规范](#dsh-distribution)
  - [dsh-dpx：dsh-distribution 的标准管理范例](#dsh-dpxdsh-distribution-的标准管理范例)
- [想让AI更好的开发dsh？](#想让ai更好的开发dsh)
- [想参与生态标准的讨论与建设？](#想参与生态标准的讨论与建设)

## dsh-std

### dsh-std是什么？

[dsh-std](https://github.com/Yan-Zero/dsh-std) 是一套通用的互操作协议。它希望 DSH 的插件、后台运行时以及各种界面能够解耦并顺畅协作。

`@dsh-std/core` 是一个“元协定”。命令（Command）、工具（Tool）、模型（Model）、界面交互（Presentation）这些具体的业务协议，都在元协定底座上进行发现和协商，各自独立演进。不同的宿主和程序只需要挑选自己需要的部分来实现。

`@dsh-std/core` 不管任何具体的业务字段，它是**“关于协定的协定”**。它只定义最底层的规则：协议叫什么名字（`apiVersion` + `kind` 坐标）、参与方怎么说“我需要什么”和“我支持什么”、怎么运行纯函数协商并产出一份结构化的兼容报告。

此外，dsh-std要求采用 Adapter 解耦。官方 DSH 内核与生态插件各自的核心诉求是不同的。官方 DSH 希望高频迭代模型调度、上下文管理和内部架构，内核不应该被外部各式各样的 UI 协议和前端标准绑死手脚；而社区插件作者希望 DSH上游接口稳定，不希望上游每次升级自己就得通宵修兼容。

**Adapter 在这里充当了“减震器”**。它把上游内核与通用协议隔开。官方内核可以自由重构、快速演进，所有可能引发破坏的变化只要在 [`@dsh-std/adapter-dsh`](vendor/meta-protocols/dsh-std/packages/adapter-dsh/README.zh.md) 这一个适配层里消化掉，生态里成千上万的插件就完全不需要改动一行代码。任何独立的 TUI、Web 前端、远程云端 Runner 也能通过各自的 Adapter 平等接入这套标准；不同项目的 Adapter 可以自动进行兼容。

### 采取dsh-std有什么好处？

- 传统单体框架把所有功能（命令、存储、事件）都硬编码在主 SDK 里，以后只要想加一个新功能，整个主框架就必须发新版甚至搞出破坏性升级。而在元协定体系下，**“协议本身”也变成了可拔插的插件——这和dsh本体的理念不谋而合**，无论是官方标准、社区扩展还是个人私有协议，都能平等地作为独立的协议接入，生态自己能无限演进
- Adapter减小了上游更新以及不同版本插件之间的兼容性，减小了开发压力
- 插件作者只要面向标准协议写代码。同一个插件写好后，可以在 TUI 终端跑，也可以在 Web 网页里跑，还能丢在 Remote SSH 远程服务或无界面的后台容器里跑，不需要针对不同平台合使用场景重写几份
- 依靠静态清单`dsh-plugin.json`，插件市场、宿主和 CI 在不运行任何插件代码的前提下，能准汇报你的环境能不能跑这个插件、需要什么权限。彻底告别“装上跑起来报错崩溃了才发现不兼容”。
- 鼓励各种激进的 Agent 架构探索。无界面集群、常驻守护 Agent、远程协作系统，各种新形态都能在元协议上直接生长。



## dsh-distribution

### dsh-distribution 是什么？

[dsh-distribution](https://github.com/T-Auto/dsh-distribution) 是一套用于描述和管理 DSH 运行环境 / 发行物 的最小元协议，他关注一个可运行的 DSH 环境如何被外部世界识别、发现和管理。当一个项目希望把自己声明为一个可发现、可验证、可管理、可迁移的 DSH 环境时，dsh-distribution提供了一套可以使用的共同语言。

> 或者有个更简单易懂的理解：大家安装python的时候都知道可以勾选“add to path”，而本协议提供了dsh整合包“add to path”的格式，以及一些扩展格式，方便跨整合包/跨dsh版本运行的包管理和路径管理

对于目前dsh官方的基于profile + bundle 组合、seam 可替换、agent-loop 可替换架构，开发者可以像拼积木一样组合出完全不同的产品：

- **dsh + TUI**：打造类似 Claude Code 的极客终端编码工具；
- **dsh + WebUI**：封装成类似 Codex App 的现代网页/桌面应用，并且 WebUI 与 TUI 可以无缝互通、共享同一套运行时状态
- **dsh + 消息接入插件**：蜕变成为一个无界面的、事件驱动的后台常驻 QQ 机器人（参考Nanobot）
- **dsh + 周期心跳插件**：演化成Neuro这样的一个 24 小时自主运行、有自己心跳和思考周期的 AI 伴侣
- **dsh + 未来未知架构**：衍生出某种我们今天尚无法定义的全新 AGI 交互形态。

这些产品形态，很多需要独立封装，独立运行，而[dsh-distribution](https://github.com/T-Auto/dsh-distribution)提出了，当一个项目成为一个“完整、可运行的 dsh 环境”之后，它应该如何向外部世界描述自己，使得多个dsh发型版本共存；插件、用户文件与配置迁移成为可能。

### 采取dsh-distribution 有什么好处？

- 不对具体产品的封装形式做约束，开发者可以发行任意形态的dsh产品
- 提供多dsh版本与插件环境隔离的可能性，使得不同的dsh产品可以在同一台电脑上共存，开发者也可以隔离多种dsh版本拆件环境便于做兼容性测试

### dsh-dpx：dsh-distribution 的标准管理范例

[dsh-dpx](https://github.com/T-Auto/dsh-dpx) 是 `dsh-distribution` 的一个真实使用者，
本仓库把它收录为**标准管理范例**：它按协议创建、注册、发现并启动多个相互隔离的
DSH 环境，把“一个 DSH 环境如何向外部世界说明自己”完整走通了一遍。

它示范了协议的三块能力：**环境身份**（每个环境根一份 `dsh-distribution.json`）、
**安装实例身份**（每次安装一个独立 `urn:uuid:`，`test` 与 `stable` 绝不混同）、
**发现**（自己的 registry，加上 Windows 上无执行权限的 discovery pointer）。
它同时示范了**不越界**：不写别的管理器的注册位置、不扫盘猜测、不把目录隔离
说成安全沙箱，也不要求别人照抄它的目录布局。

范例不是标准，也不是唯一的管理器。完整说明（含真实用法、复算验证与照抄清单）见
[`docs/examples/dsh-dpx.md`](docs/examples/dsh-dpx.md)。



## 想让AI更好的开发dsh？





## 想参与生态标准的讨论与建设？

- 提交前先读 [`CONTRIBUTING.md`](CONTRIBUTING.md)（分区纪律、PR 要件、禁止顺手规范化）；
- 东西该放哪、新协议怎么挂：[`docs/directory-guide.md`](docs/directory-guide.md)；
- 治理与权威归属：[`governance/README.md`](governance/README.md)；
- 具体协议的语义讨论请到对应上游仓库（见 [`registry/protocols.json`](registry/protocols.json) 的 `upstream`）。

