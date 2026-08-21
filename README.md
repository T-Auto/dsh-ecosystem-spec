# dsh-ecosystem-spec

> **DSH Community Ecosystem Interoperability Specification**  
> 社区插件互操作规范实验库

## 使用此协议有什么好处？

所有采用`dsh-ecosystem-spec`的插件均可自动适配所有dsh本体旧版本以及未来的版本，无需顾虑多版本兼容性。

`dsh-ecosystem-spec`还提供依赖链溯源，以及可选的正在实验中的插件热更新功能。这些提供功能性的额外协定都是可选项，无论是否选择遵守，都不会与其他遵守情况的插件产生冲突。

## 项目定位

`dsh-ecosystem-spec` 是使用[dsh-std](https://github.com/Yan-Zero/dsh-std)的协议的插件标准，所有采用`dsh-ecosystem-spec`的插件均可使用dsh-std维护的dsh-adapter，自动适配所有dsh本体旧版本以及未来的版本。同时，`dsh-ecosystem-spec`规范了[dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI)子插件及兼容插件的生态准入 profile。

本仓库是[dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI)维护的社区标准。除了为插件提供与dsh上游接口的解耦性适配，同时希望所有进入 `dsh-TUI` 启动方式的插件、`dsh-TUI` 维护的插件市场与推荐列表，应满足 TUI 当前声明的准入版本与验证要求。

当前规范与测试均为 Draft / Experimental；在 Candidate/Stable 条件满足前，使用者只能声明“实验适配”。


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
