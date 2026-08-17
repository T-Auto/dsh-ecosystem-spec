# dsh-ecosystem-spec

> **DSH Community Ecosystem Interoperability Specification**  
> 社区插件互操作规范实验库

## 项目定位

`dsh-ecosystem-spec` 是`dsh-TUI` 插件生态的准入 profile，为 dsh-TUI 的插件生态建立强制遵守的规则，以及作为社区侧、实验性的 dsh 插件互操作规范与可执行测试资产库。

本仓库不是 dsh 官方标准，不代表 dsh 官方立场，不要求官方立即采纳，也不授予官方认证。当前 `Community Consensus v0.1` 和 `dsh-TUI Admission v0.1` 都是 Draft / Experimental；在 Candidate/Stable 条件满足前，使用者只能声明“实验适配”。

本库兼容 `Community Consensus v0.1`及后续标准，但在有关`dsh-TUI`适配于扩展插件的兼容上做了更强制的约束，希望进入 `dsh-TUI`  启动方式的插件， `dsh-TUI`  维护的插件市场、推荐列表，应满足 TUI 当前声明的准入版本与验证要求。

- TUI 规范定义的是“进入 TUI 生态所需的额外约束”
- 考虑到 TUI 本身的应用场景，`dsh-ecosystem-spec`规范要求比社区规范更严格的可验证性、可回滚性、远程运行确定性和溯源能力
- TUI 的额外要求必须明确标记为 `TUI-*`，不会写进 Community Consensus

本库会优先响应 dsh 官方发布的标准，其次响应 `Community Consensus v0.1`及后续标准，最后则是为适配`dsh-TUI` 插件的的私有标准。

## 边界

- `spec/community-consensus-v0.1.md`：Community v0.1 core contract；只以本文及其 normative assets 为准。
- `spec/tui-admission-v0.1.md`：TUI 市场准入 policy；只约束 TUI 生态，不倒灌 Community contract。
- `rfc/0002-0005`：延期或实验 RFC；不是 Community v0.1 core。
- `schemas/`、`registry/`、`conformance/fixtures/`、`conformance/tests/`：机器可执行资产，与规范文本共同定义可验证行为。
- schema `$id` / `$schema` 中的 `https://dsh.community/` 是**不可解析的占位命名空间**，仅作标识符使用，不要求 HTTP 可获取。
- `registry/host-descriptor.tui.example.json` 是协商测试用的示例（`hostVersion` 为示意值），不构成 dsh-TUI 任一真实发布版本的 Host Descriptor 声明。

参考实现、TUI 本身或任何单一宿主只能提供 evidence，不能因为实现存在就成为标准或自我认证。

## 快速验证

环境要求：Node.js 18 或更高版本，无需安装依赖。

```text
npm test
```

测试覆盖 manifest/Host Descriptor/event envelope/ledger/claim 的正反 fixture、registry hash 漂移检查、required/optional 协商、授权等待、授权后通过和重复 command ID 拒绝。

## 文档地图

| 文档 | 作用 |
|---|---|
| `spec/community-consensus-v0.1.md` | Community v0.1 core contract |
| `spec/tui-admission-v0.1.md` | TUI 产品准入 profile |
| `PLUGIN-ADMISSION-CHECKLIST.md` | TUI 人机联合检查表 |
| `schemas/` | Manifest、Host、事件、ledger、claim schema |
| `registry/` | 真实 contract/permission registry 与 hash |
| `conformance/` | evidence、requirement matrix、fixtures、测试 runner |
| `proposals/tui-proposals.md` | TUI 实验性提案 |
| `governance/rules.md` | 权威边界和变更约束 |
| `rfc/0000-governance.md` | RFC 状态和决策要求 |

## 状态词

- `Draft`：讨论中，不构成稳定 contract；
- `Experimental`：允许实现，但可能 breaking；
- `Candidate`：规范、资产和测试基本稳定，等待多实现验收；
- `Stable`：经过治理批准并具备独立 conformance evidence；
- `Deprecated`：保留迁移窗口，不再鼓励新实现。

“Community Draft”“Deferred from v0.1”仅作为说明性标签，正式状态必须使用上述枚举。日期字段由发布流程维护，本仓库不以日期缺失阻断当前实验实现。

在进入 `Stable` 前，任何规范均不得暗示 ABI/API 永久稳定或“官方认证”。

## 规范层级

优先级从高到低：

1. **实际执行环境与安全边界**
2. **已批准的社区规范版本**
3. **TUI 准入规则**
4. **实验性 TUI 提案**
5. **实现细节与参考实现**
