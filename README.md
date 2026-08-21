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
- 私有协议使用标准的 `apiVersion + kind` 契约坐标，统一注册到 dsh-std 的 `ProtocolCatalog`。`tui.dsh/*` 命名空间仅表示其兼容性由 dsh-TUI 维护，不会获得另一套私有的发现、协商或生命周期机制。

## 愿景与优点

### 分层愿景

本仓库是 dsh-std 三层结构中的一层：

```text
元协议（dsh-std core）   只约定“如何声明与协商协议”，不预设领域概念
    │
独立领域协议（dsh-std）  connection / command / tool / session / presentation ... 独立版本化
    │
Profile（本仓库）        面向 TUI 产品形态的准入与互操作规范（TUI Admission）
```

本仓库**只约束 TUI 生态**（全部要求带 `TUI-*` 标记，不倒灌通用 Community Consensus），不干预其他社区对无界面设施、常驻 Agent、远程 Runtime 等激进 Agent 架构的探索。

### 类似 pi 的开发体验

在元协议之上，本 Profile 为开发者提供**类似 pi 的 “Host + Plugin + Manifest” 开发体验**（即现代开发者熟悉的 pi + pi 扩展形态）：写一份静态 manifest 声明“我是谁、需要什么能力”，由 TUI Host 协商、授权、按统一生命周期激活；插件作者获得清晰、可执行的准入规范与 conformance 保障，不需要自建宿主。

### 优点

- **自动向前兼容**：插件只要遵循本准入规范，使用已被 dsh-std 协议抽象覆盖、且能够在 adapter 层映射的上游变化的接口，即可无视 dsh 上游接口变动，达到免维护自动适配；
- **依赖简单**：插件按需选择最小 `@dsh-std/*` 协议子集，只实现需要的部分，不绑定整个框架；
- **自动维护上游接口变动与转译**：上游类型只出现在唯一适配层 `@dsh-std/adapter-dsh`，上游任何重命名、重构、替换内部面都只需修改这一个 adapter 的内部映射（转译），所有协议与插件契约不动；adapter 可由任何第三方作者重写，不依赖单个维护方；
- **硬性证据链、可独立验证**：conformance suite（39 项断言、30+ fixtures、requirements 矩阵、profileHash sha256）允许社区独立复算与验证，evidence 五元组绑定 std revision / profile / Host / artifact / suite。

## 生态扩展

使用dsh-ecosystem-spec规范的dsh-tui功能扩展插件已收录于https://github.com/oh-my-dsh/dsh-community-standard ，现已收录13个。由于当前协定还在试验，排障，debug阶段，收录有较大延迟

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
pnpm test          # 在 dsh-TUI workspace 内（复用 workspace 安装的 @dsh-std/*）
npm run test:standalone   # 独立检出时（强制 vendor/dsh-std 回退路径）
```

在 dsh-TUI workspace 中，conformance suite 直接使用 workspace 安装的 `@dsh-std/*`。独立检出本仓库时（无 workspace 提供 `@dsh-std/*`），pnpm 会因 `workspace:*` peerDependencies 预检失败，请改用 `npm run test:standalone`（等价入口 `node scripts/conformance.mjs --standalone`）：它会初始化固定 revision 的 `vendor/dsh-std`，在非交互模式下安装、构建后，于仓库根 `node_modules` 建立指向构建产物的链接，再运行相同的 suite。`npm run test` 复用已安装或已构建的依赖，`npm run validate`（`--no-build`）只使用已经安装或构建的依赖。生成的 `lib` 不提交到本仓库。

测试覆盖 manifest、Host Descriptor、event envelope、ledger 与 claim 的正反 fixture，以及 registry hash 漂移、契约坐标解析、required/optional 协商、授权状态、重复 command ID、保留 facet 和 ContentBlock payload 校验。

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
