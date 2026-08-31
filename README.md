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

> **DSH 社区生态互操作、conformance、registry 与治理的规范入口。**
> **公共协议语义以 dsh-std 的固定 revision 为 normative source。**
> **本仓库不声称 DeepSeek 官方认证或官方采用，也不声称自己是唯一标准。**

## 这是什么？

- 社区生态事实层：记录生态里有哪些协议、实现、Profile、兼容声明；
- 公共协议由 [dsh-std](https://github.com/Yan-Zero/dsh-std) 定义，本仓库通过 `vendor/dsh-std` 固定引用；
- 具体产品形态由 Profile 定义，当前已有完整示例：dsh-tui；
- 提供 conformance、registry、adapter、governance 等生态基础设施。

## 协定是干什么的？

1. 公共协议（dsh-std）：让插件、宿主、工具、市场用同一套坐标声明、发现和协商；
2. Profile（本仓库）：面向某个产品形态的准入、权限、验证与展示规则；
3. Adapter Note：记录某宿主/运行时与公共契约的映射，不改变标准语义。

## 为什么是去中心化的？

- 不设唯一官方市场、不设特权宿主；
- 多个实现、多个市场、多个社区仓库可以并存；
- 官方可以自由演进，社区通过 adapter、协议版本和 Profile 演进吸收变化；
- 权威跟随资产：谁拥有协议、仓库、市场，谁对自己的资产有决定权。

## 仓库四区

```text
这是入口          → README / docs/
这是提案与讨论    → rfc/ proposals/ decisions/
这是稳定的协议    → dsh-std/（vendor submodule）
这是具体 Profile  → profiles/dsh-tui/（渐进迁移中；当前 TUI 内容仍在根级 registry/、conformance/、adapters/）

横切区：
治理            → governance/ + GOVERNANCE.md
生态事实         → registry/ + conformance/
历史与信用       → decisions/ + credits/
```

## 从哪开始？

| 我想做什么 | 去这里 |
| --- | --- |
| 快速理解生态 | [docs/overview.md](docs/overview.md) |
| 了解目录与文档导航 | [docs/README.md](docs/README.md) |
| 写一个 TUI 插件 / 查准入 | [docs/plugin-admission-and-development.md](docs/plugin-admission-and-development.md) |
| 做一个宿主 / Adapter | [adapters/README.md](adapters/README.md) |
| 提一个公共协议 | [vendor/dsh-std/docs/proposals/](vendor/dsh-std/docs/proposals/) + [rfc/README.md](rfc/README.md) |
| 提一个 Profile / TUI 准入 | [proposals/tui-proposals.md](proposals/tui-proposals.md) |
| 查上游 dsh 变化影响 | [docs/upstream-analysis/](docs/upstream-analysis/README.md) |
| 查实现 / claim / registry | [registry/README.md](registry/README.md) |
| 参与治理与决策 | [GOVERNANCE.md](GOVERNANCE.md) / [decisions/README.md](decisions/README.md) |

## 当前 Profile 与边界

- 当前第一个完整 Profile 示例是 **dsh-tui**；
- 使用 dsh-tui 维护的 adapter 可自动适配其所覆盖的 dsh 旧版本与未来版本；未覆盖接口不承诺免维护；
- 遵循本规范的 dsh-tui 插件/扩展已收录于 [tui 插件市场](https://dshtui.com/plugins/)（当前 23 个）；
- 当前根级 `registry/`、`conformance/`、`adapters/`、`protocols/` 仍以 TUI 为主，正在按阶段下沉到 `profiles/dsh-tui/`（渐进迁移，见 [docs/overview.md](docs/overview.md)）；
- 当前规范与测试均为 Draft / Experimental；在 Candidate/Stable 条件满足前，使用者只能声明“实验适配”；
- 参考实现、TUI 本身或任何单一宿主只能提供 evidence，不能因为实现存在就成为标准或自我认证；
- capability / permission 不是安全边界；任何 evidence 都不是“安全插件”或“官方认证”的证明。

## 快速验证

环境要求：Node.js 18 或更高版本，启用 `corepack`。

```sh
pnpm test          # 在 dsh-TUI workspace 内（复用 workspace 安装的 @dsh-std/*）
npm run test:standalone   # 独立检出时（强制 vendor/dsh-std 回退路径）
```

对任意真实插件 manifest 做准入校验（与 conformance suite 共用同一套 admission 算法；会按需准备 dsh-std）：

```sh
npm run validate:manifest -- --manifest ./path/to/dsh-plugin.json   # 可选 --host <host-descriptor.json> 与 --grant <permission>
```

在 dsh-TUI workspace 中，conformance suite 直接使用 workspace 安装的 `@dsh-std/*`。独立检出本仓库时（无 workspace 提供 `@dsh-std/*`），pnpm 会因 `workspace:*` peerDependencies 预检失败，请改用 `npm run test:standalone`（等价入口 `node scripts/conformance.mjs --standalone`）：它会初始化固定 revision 的 `vendor/dsh-std`，在非交互模式下安装、构建后，于仓库根 `node_modules` 建立指向构建产物的链接，再运行相同的 suite。`npm run test` 复用已安装或已构建的依赖，`npm run validate`（`--no-build`）只使用已经安装或构建的依赖。生成的 `lib` 不提交到本仓库。

测试覆盖 manifest、Host Descriptor、event envelope、ledger 与 claim 的正反 fixture，以及 registry hash 漂移、契约坐标解析、required/optional 协商、授权状态、重复 command ID、保留 facet 和 ContentBlock payload 校验。

生成的构建产物仅存在于 submodule 工作区，不提交到本仓库。

## 文档地图

| 文档 / 路径 | 作用 |
| --- | --- |
| [`docs/README.md`](docs/README.md) | 文档导航总页 |
| [`docs/overview.md`](docs/overview.md) | 生态总览与读者导引 |
| [`docs/plugin-admission-and-development.md`](docs/plugin-admission-and-development.md) | **唯一整合文档**：Community v0.15 基线、TUI Admission v0.15、接口与兼容性协定、插件开发指南与准入检查清单 |
| [`docs/upstream-analysis/`](docs/upstream-analysis/README.md) | DSH 核心版本变动分析（含模板与首批条目） |
| [`adapters/`](adapters) | 宿主 Adapter 映射表与适配 Note（[`dsh-tui-v0.15.md`](adapters/dsh-tui-v0.15.md) 映射表、[`dsh-tui-vscode-v0.15.md`](adapters/dsh-tui-vscode-v0.15.md)） |
| [`vendor/dsh-std/`](vendor/dsh-std) | 固定引用的 dsh-std 公共核心协议基线 (submodule) |
| [`registry/registry-0.15.json`](registry/registry-0.15.json) | 当前 TUI profile 导入的 std 定义与自有定义注册表 |
| [`protocols/profile-definitions.js`](protocols/profile-definitions.js) | 可由 dsh-std core 装载的 TUI 私有定义 |
| [`conformance/`](conformance) | evidence、requirement matrix、fixtures 与测试 runner |
| [`rfc/README.md`](rfc/README.md) | RFC / 跨仓库提案索引与流程 |
| [`rfc/0000-governance.md`](rfc/0000-governance.md) | RFC 状态和生态治理基础 |
| [`governance/rules.md`](governance/rules.md) | 权威边界和变更约束 |
| [`GOVERNANCE.md`](GOVERNANCE.md) | 治理总纲：角色、决策、异议与申诉 |
| [`decisions/README.md`](decisions/README.md) | 讨论反馈处置记录 |
| [`credits.md`](credits.md) | 规范作者、实现作者与早期采用者矩阵 |

## 状态词

- `Draft`：讨论中，不构成稳定 contract；
- `Experimental`：允许实现，但可能 breaking；
- `Candidate`：规范、资产和测试基本稳定，等待多实现验收；
- `Stable`：经过治理批准并具备独立 conformance evidence；
- `Deprecated`：保留迁移窗口，不再鼓励新实现。

“Community Draft”“Deferred from v0.15”仅作为说明性标签，正式状态必须使用上述枚举。在进入 `Stable` 前，任何规范均不得暗示 ABI/API 永久稳定或“官方认证”。

## 规范层级

优先级从高到低：

1. **实际执行环境与安全边界**
2. **已批准的社区核心规范**
3. **已固定的 dsh-std revision 规范**
4. **TUI 准入规则（TUI Admission Profile）**
5. **实验性 TUI 提案（RFC）**
6. **实现细节与参考实现**
