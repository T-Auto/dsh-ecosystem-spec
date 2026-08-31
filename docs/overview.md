# 生态总览

> **定位**：本文帮助第一次接触的读者理解 DSH 社区生态的组成、协定分层与治理方式。
> **非官方声明**：本体系是社区生态入口，不声称 DeepSeek 官方认证、官方采用或唯一标准。

## 1. 这个项目是干什么的

`dsh-ecosystem-spec` 是 DSH 社区生态的**规范入口与事实层**，负责：

- 记录生态里有哪些协议、哪些实现、谁声明了兼容；
- 提供 conformance、registry、adapter、governance 这些生态基础设施；
- 把 `dsh-std` 的公共协议固定下来引用，而不是自己重写一套；
- 把 TUI、WebUI、GUI、headless、远端 runtime 等具体产品形态作为 **Profile** 管理。

官方仓库回答“我们自己的实现是什么”；`dsh-ecosystem-spec` 回答“整个社区生态是什么、
谁实现了什么、如何验证、如何演进”。

## 2. dsh-std / dsh-ecosystem-spec / dsh-tui 的关系

```text
+-----------------------------------+
| dsh-ecosystem-spec                |
| 生态入口 / 治理 / Registry /      |
| Conformance / Adapter / Profile   |
+------------------+----------------+
                   | 固定 dsh-std revision
                   v
+-----------------------------------+
| dsh-std                           |
| 公共协议定义 + 参考实现 + SDK     |
+------------------+----------------+
                   ^
                   | 消费者 / 参考实现 / 证据
+-----------------------------------+
| dsh-tui / 其他 Host / 第三方实现  |
+-----------------------------------+
```

| 仓库 / 生态位 | 角色 | 拥有 | 不拥有 |
| --- | --- | --- | --- |
| `dsh-ecosystem-spec` | 社区生态事实、验证与治理入口 | governance、RFC 索引、profiles、registry、conformance、adapters、credits、版本兼容记录 | 不重新定义 dsh-std 协议语义；不自我认证；不替官方表态 |
| `dsh-std` | 公共协议定义层 + 参考实现 | 公共协议定义、ProtocolCatalog、manifest、command、session、tool、storage、messages、presentation 等 | 不定义 TUI 产品准入；不替代生态治理；不自我认证为官方标准 |
| `dsh-tui` / 其他实现 | 消费者、参考实现、证据提供方 | 实现、conformance claim、registry 登记、使用证据 | 不能自称为官方实现 |

## 3. 协定分几种

1. **公共协议层（dsh-std）**
   - 定义“如何声明、发现、协商协议”；
   - 定义命令、会话、工具、存储、消息、呈现等领域契约；
   - 是可以独立实现、独立版本化的互操作基础。

2. **Profile 层（dsh-ecosystem-spec）**
   - 在公共协议之上，定义面向某个具体产品形态的准入、兼容、权限、证据与市场展示规则；
   - 例如 `dsh-tui` Profile，只约束 TUI 生态；
   - 不把 TUI 的规则倒灌成所有 DSH 生态的强制要求。

3. **Adapter Note 层**
   - 记录某宿主/运行时与公共 contract 的映射，不含新的标准语义；
   - 只描述它所对应的宿主版本，不要求其他宿主遵守。

## 4. 这些协定解决什么问题

- 插件、宿主、工具、市场不再各自发明接口；
- 兼容性可以通过 conformance、fixtures、evidence 独立复算，不靠“某个实现说兼容”；
- 公共协议和领域协议独立版本化，改一个领域不用全生态重发；
- 上游 dsh 内部变化收敛到 adapter，社区不必跟着每次重构重写插件。

## 5. 使用这些协定的好处

- **可互操作**：统一坐标、声明、发现与协商；
- **可验证**：conformance、fixtures、evidence 可复算；
- **可演进**：公共协议与 Profile 分层演进；
- **可适配**：上游变化由 adapter 吸收；
- **可去中心**：不设唯一官方市场、不设特权宿主、不要求某一产品形态统治生态；
- **可追溯**：registry、claim、ledger、decisions 都有记录。

## 6. 为什么是去中心化的

DSH 生态天然是“多种宿主 / 多种终端 / 多种市场 / 多种实现 / 多种社区仓库”。
如果由单一仓库、单一产品、单一市场或单一组织定义“生态标准”，就会把某个产品的
限制变成全生态限制，并让市场、终端、插件作者失去自主演进空间。

因此本设计坚持：

1. **权威跟随资产**：谁拥有协议、仓库、市场，谁对自己的资产有决定权；
2. **公共协议只定义最小共识**：`@dsh-std/core` 只声明和协商，不预设未来形态；
3. **Profile 只约束自己**：TUI 规则带 `TUI-*`，不要求其他 Host 采用；
4. **多个 registry / market / catalog 可以并存**：本仓库记录事实，不任命唯一市场；
5. **官方可以自由演进**：社区通过 adapter 和新协议版本吸收变化，不请求官方冻结内部接口。

## 7. 当前状态与边界

- 当前第一个完整 Profile 示例是 **dsh-tui**；
- 本仓库当前大量内容仍是 TUI 专属（`registry/`、`conformance/`、`adapters/`、
  `protocols/`、`proposals/`），正在按阶段下沉到 `profiles/dsh-tui/`；
- 根级 `registry/` 与 `conformance/` 将逐步成为跨 Profile 的生态事实层；
- 所有规范与测试在进入 `Candidate` / `Stable` 前只能表述为实验或草稿；
- **capability / permission 不是安全边界**；任何 evidence 都不是“安全插件”或“官方认证”的证明；
- **参考实现不是标准**；实现存在不能自我认证。

## 8. 如何参与

| 我想做什么 | 去这里 |
| --- | --- |
| 快速理解文章 | 本文 |
| 写 TUI 插件 | [`plugin-admission-and-development.md`](plugin-admission-and-development.md) |
| 提公共协议 | `vendor/dsh-std/docs/proposals/`，并在本仓库 `rfc/` 登记索引 |
| 提 Profile / TUI 准入 | [`proposals/`](../proposals/tui-proposals.md) |
| 记录 Adapter | [`adapters/`](../adapters/README.md) |
| 提供 conformance 证据 | [`conformance/`](../conformance/README.md) |
| 参与治理与决策 | [`GOVERNANCE.md`](../GOVERNANCE.md)、[`decisions/`](../decisions/README.md) |
| 跟踪上游 DSH 变化 | [`upstream-analysis/`](upstream-analysis/README.md) |
