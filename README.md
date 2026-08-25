<p align="center">
  <img src="docs/assets/logo_f.svg" alt="dsh-ecosystem-spec - DSH Community Ecosystem Interoperability Specification" width="560">
</p>

<p align="center">
  <img alt="Compliant Plugins" src="https://img.shields.io/badge/Compliant%20Plugins-23-4b6fff?style=flat">
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-2e8b57?style=flat">
  <img alt="GitHub Stars" src="https://img.shields.io/github/stars/T-Auto/dsh-ecosystem-spec?style=flat&color=eab308">
  <img alt="GitHub Forks" src="https://img.shields.io/github/forks/T-Auto/dsh-ecosystem-spec?style=flat&color=8b5cf6">
</p>

# dsh-ecosystem-spec

> **DSH Community Ecosystem Interoperability Specification**  
> 社区插件互操作规范实验库

## 使用此协议有什么好处？

[dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI)团队维护了一套adapter，如果你的dsh采用该adapter和dsh本体通信，那即可自动适配所有dsh本体旧版本以及未来的版本，无需顾虑多版本兼容性。若你的插件想使用[dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI)团队维护的adapter达到dsh版本更新时免维护的便利性，请阅读并遵循此规范。

`dsh-ecosystem-spec`还提供依赖链溯源，以及可选的正在实验中的插件热更新功能。这些提供功能性的额外协定都是可选项，无论是否选择遵守，都不会与其他遵守情况的插件产生冲突。

## 项目定位

`dsh-ecosystem-spec` 存放了[dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI)团队维护的adapter的映射表，同时是使用[dsh-std](https://github.com/Yan-Zero/dsh-std)的协议的插件标准。所有进入 `dsh-TUI` 启动方式的插件、`dsh-TUI` 维护的插件市场与推荐列表，应满足 TUI 当前声明的准入版本与验证要求。

使用非本adapter覆盖的接口范围无法保证后续dsh更新的的免维护性。本adapter覆盖的接口范围会逐渐增加，如果您想把您所需的dsh上游api加入本adapter的覆盖范围，可以在本仓库提issue，tui团队在评估后会考虑是否将其纳入后续adapter映射维护。

## 生态扩展

使用dsh-ecosystem-spec规范的dsh-tui功能扩展插件及遵循spec规范规范的社区插件已收录于[tui插件市场](https://dshtui.com/plugins/) ，现已收录23个。

## 边界

- `vendor/dsh-std/`：通过 git submodule 固定的 dsh-std 公共契约基线与核心资产。
- [`docs/plugin-admission-and-development.md`](docs/plugin-admission-and-development.md)：**唯一整合入口**，包含 Community v0.15 基线、TUI Admission v0.15、接口与兼容性协定、插件开发指南与准入检查清单。
- `protocols/profile-definitions.js`：可由 dsh-std core 装载的 TUI 私有协议定义。
- `registry/registry-0.15.json`：本 profile 导入的 std 定义与自有定义注册表。
- `conformance/`：测试 fixtures、requirement matrix 与准入测试 runner。
- `adapters/`：宿主/运行时版本与公共 contract 的适配映射表（Adapter Note），不改变标准语义。
- `rfc/`：TUI 增量协议提案及保留的历史 RFC 路径。
- 当前规范与测试均为 Draft / Experimental；在 Candidate/Stable 条件满足前，使用者只能声明“实验适配”。

参考实现、TUI 本身或任何单一宿主只能提供 evidence，不能因为实现存在就成为标准或自我认证。

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
| [`docs/plugin-admission-and-development.md`](docs/plugin-admission-and-development.md) | **唯一整合文档**：Community v0.15 基线、TUI Admission v0.15、接口与兼容性协定、插件开发指南与准入检查清单 |
| [`adapters/`](adapters) | 宿主 Adapter 映射表与适配 Note（[`dsh-tui-v0.15.md`](adapters/dsh-tui-v0.15.md) 映射表、[`dsh-tui-vscode-v0.15.md`](adapters/dsh-tui-vscode-v0.15.md)） |
| [`vendor/dsh-std/`](vendor/dsh-std) | 固定引用的 dsh-std 公共核心协议基线 (submodule) |
| [`registry/registry-0.15.json`](registry/registry-0.15.json) | 本 profile 导入的 std 定义与自有定义注册表 |
| [`protocols/profile-definitions.js`](protocols/profile-definitions.js) | 可由 dsh-std core 装载的 TUI 私有定义 |
| [`conformance/`](conformance) | evidence、requirement matrix、fixtures 与测试 runner |
| [`rfc/`](rfc) | TUI 增量协议及保留的历史 RFC 路径 |
| [`governance/rules.md`](governance/rules.md) | 权威边界和变更约束 |
| [`rfc/0000-governance.md`](rfc/0000-governance.md) | RFC 状态和决策要求 |

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
