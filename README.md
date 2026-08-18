# dsh-ecosystem-spec

> **DSH Community Ecosystem Interoperability Specification**  
> 社区插件互操作规范实验库

## 项目定位

`dsh-ecosystem-spec` 是[dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI)子插件及兼容插件的生态准入 profile，使用[dsh-std](https://github.com/Yan-Zero/dsh-std)的协议兼容标准，承担社区RFC共识落地验证与实现作用。本仓库为 dsh-TUI 的插件生态建立强制遵守的规则，以及作为社区侧、实验性的 dsh 插件互操作规范与可执行测试资产库。

本仓库不是 dsh 官方标准，不代表 dsh 官方立场，不要求官方立即采纳，也不授予官方认证。当前规范与测试均为 Draft / Experimental；在 Candidate/Stable 条件满足前，使用者只能声明“实验适配”。

本仓库在有关 `dsh-TUI` 适配与扩展插件的兼容上做了更强制的约束，希望进入 `dsh-TUI` 启动方式的插件、`dsh-TUI` 维护的插件市场与推荐列表，应满足 TUI 当前声明的准入版本与验证要求。

- TUI 规范定义的是“进入 TUI 生态所需的额外约束”；
- 考虑到 TUI 本身的应用场景，`dsh-ecosystem-spec` 要求比通用社区规范更严格的可验证性、可回滚性、远程运行确定性和溯源能力；
- TUI 的额外要求必须明确标记为 `TUI-*`，不会倒灌进通用的 Community Consensus；
- 私有协议使用标准的 `apiVersion + kind` 契约坐标，统一注册到 dsh-std 的 `ProtocolCatalog`。`x-ccch1mneyyy.tui/*` 命名空间仅表示其兼容性由 dsh-TUI 维护，不会获得另一套私有的发现、协商或生命周期机制。

## 边界

- `vendor/dsh-std/`：通过 git submodule 固定的 dsh-std 公共契约基线与核心资产。
- `spec/community-consensus-v0.15.md`：dsh-std 公共基线的稳定引用入口。
- `spec/tui-admission-v0.15.md`：TUI 市场准入 profile；只约束 TUI 生态，不倒灌通用公共契约。
- `protocols/profile-definitions.js`：可由 dsh-std core 装载的 TUI 私有协议定义。
- `registry/registry-0.15.json`：本 profile 导入的 std 定义与自有定义注册表。
- `conformance/`：测试 fixtures、requirement matrix 与准入测试 runner。
- `rfc/`：TUI 增量协议提案及保留的历史 RFC 路径。

参考实现、TUI 本身或任何单一宿主只能提供 evidence，不能因为实现存在就成为标准或自我认证。

## 快速验证

环境要求：Node.js 18 或更高版本，启用 `corepack`。

```sh
git submodule update --init
corepack enable
pnpm test
```

`pnpm test` 会按 submodule 固定的 revision 安装并构建 dsh-std，然后运行 TUI admission suite。测试覆盖 manifest/Host Descriptor/event envelope/ledger/claim 的正反 fixture、registry hash 漂移检查、契约坐标解析（未知 group/kind 拒绝、未注册版本判 unknown）、required/optional 协商、授权等待、授权后通过、重复 command ID 拒绝、client/worker facet 拒绝和 ContentBlock payload 校验。

生成的构建产物仅存在于 submodule 工作区，不提交到本仓库。

## 文档地图

| 文档 / 路径 | 作用 |
| --- | --- |
| [`spec/community-consensus-v0.15.md`](spec/community-consensus-v0.15.md) | dsh-std 公共基线的稳定引用入口 |
| [`spec/tui-admission-v0.15.md`](spec/tui-admission-v0.15.md) | dsh-TUI 产品准入 profile（市场准入要求） |
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
