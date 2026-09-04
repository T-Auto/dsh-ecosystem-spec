<p align="center">
  <img src="docs/assets/logo_f.svg" alt="dsh-ecosystem-spec - DSH Community Ecosystem Interoperability Specification" width="560">
</p>

<p align="center">
  <a href="https://github.com/T-Auto/dsh-ecosystem-spec/actions/workflows/ci.yml">
    <img alt="CI" src="https://img.shields.io/github/actions/workflow/status/T-Auto/dsh-ecosystem-spec/ci.yml?branch=main&style=flat">
  </a>
  <img alt="Compliant Plugins" src="https://img.shields.io/badge/Compliant%20Plugins-23-4b6fff?style=flat">
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-2e8b57?style=flat">
  <img alt="GitHub Stars" src="https://img.shields.io/github/stars/T-Auto/dsh-ecosystem-spec?style=flat&color=eab308">
  <img alt="GitHub Forks" src="https://img.shields.io/github/forks/T-Auto/dsh-ecosystem-spec?style=flat&color=8b5cf6">
</p>

# dsh-ecosystem-spec

> **DSH Community Ecosystem Interoperability Specification**  
> 社区插件互操作规范实验库

※本文档正在修订中，在这句话被删除之前，请以/old的全量备份为准

## 这是什么项目？

这是由[dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI)团队和[DSH-Desktop-EAC](https://github.com/zouyuxuan122/DSH-Desktop-EAC)团队联合发起的社区协议，提供一套可选、可验证的互操作共识。有详细文档、验证自动化流程及**全套的skill**。

本协议旨在减小对dsh上游变更的适配压力，降低维护成本，增加多插件多版本运行时的兼容性，稳定性和可回退性。本协议不对社区开发者作任何功能性约束，不影响dsh本体演进，鼓励对新形态插件和应用的探索。

本项目欢迎任何dsh开发者发起issue讨论或pr。

## 目录

- [这是什么项目？](#这是什么项目)
- [如果你是插件开发者，请看 → dsh-std](#如果你是插件开发者请看--dsh-std)
  - [dsh-std是什么？](#dsh-std是什么)
  - [采取dsh-std有什么好处？](#采取dsh-std有什么好处)
- [如果你是整合包作者，请看 → dsh-distribution](#如果你是整合包作者请看--dsh-distribution)
- [想让AI更好的开发dsh？](#想让ai更好的开发dsh)

## 如果你是插件开发者，请看 → [dsh-std](https://github.com/Yan-Zero/dsh-std)

### dsh-std是什么？

[dsh-std](https://github.com/Yan-Zero/dsh-std) 是一套通用的互操作协议。它希望 DSH 的插件、后台运行时以及各种界面能够解耦并顺畅协作。

`@dsh-std/core` 是一个“元协定”。命令（Command）、工具（Tool）、模型（Model）、界面交互（Presentation）这些具体的业务协议，都在元协定底座上进行发现和协商，各自独立演进。不同的宿主和程序只需要挑选自己需要的部分来实现。

`@dsh-std/core` 不管任何具体的业务字段，它是**“关于协定的协定”**。它只定义最底层的规则：协议叫什么名字（`apiVersion` + `kind` 坐标）、参与方怎么说“我需要什么”和“我支持什么”、怎么运行纯函数协商并产出一份结构化的兼容报告。

此外，dsh-std要求采用 Adapter 解耦。官方 DSH 内核与生态插件各自的核心诉求是不同的。官方 DSH 希望高频迭代模型调度、上下文管理和内部架构，内核不应该被外部各式各样的 UI 协议和前端标准绑死手脚；而社区插件作者希望 DSH上游接口稳定，不希望上游每次升级自己就得通宵修兼容。

**Adapter 在这里充当了“减震器”**。它把上游内核与通用协议隔开。官方内核可以自由重构、快速演进，所有可能引发破坏的变化只要在 [`@dsh-std/adapter-dsh`](packages/adapter-dsh/README.zh.md) 这一个适配层里消化掉，生态里成千上万的插件就完全不需要改动一行代码。任何独立的 TUI、Web 前端、远程云端 Runner 也能通过各自的 Adapter 平等接入这套标准；不同项目的 Adapter 可以自动进行兼容。

### 采取dsh-std有什么好处？

- 传统单体框架把所有功能（命令、存储、事件）都硬编码在主 SDK 里，以后只要想加一个新功能，整个主框架就必须发新版甚至搞出破坏性升级。而在元协定体系下，**“协议本身”也变成了可拔插的插件——这和dsh本体的理念不谋而合**，无论是官方标准、社区扩展还是个人私有协议，都能平等地作为独立的协议接入，生态自己能无限演进
- Adapter减小了上游更新以及不同版本插件之间的兼容性，减小了开发压力
- 插件作者只要面向标准协议写代码。同一个插件写好后，可以在 TUI 终端跑，也可以在 Web 网页里跑，还能丢在 Remote SSH 远程服务或无界面的后台容器里跑，不需要针对不同平台合使用场景重写几份
- 依靠静态清单`dsh-plugin.json`，插件市场、宿主和 CI 在不运行任何插件代码的前提下，能准汇报你的环境能不能跑这个插件、需要什么权限。彻底告别“装上跑起来报错崩溃了才发现不兼容”。
- 鼓励各种激进的 Agent 架构探索。无界面集群、常驻守护 Agent、远程协作系统，各种新形态都能在元协议上直接生长。



## 如果你是整合包作者，请看 → [dsh-distribution](https://github.com/T-Auto/dsh-distribution)





## 想让AI更好的开发dsh？





## 想参与生态标准的讨论与建设？

