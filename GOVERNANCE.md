# Governance — 生态治理总纲

> 本文件是 `dsh-ecosystem-spec` 的治理总纲：角色、决策、异议与申诉。
> 具体规范边界见 [`governance/rules.md`](governance/rules.md)，
> 提案状态与评审要求见 [`rfc/README.md`](rfc/README.md)，
> 讨论反馈处置见 [`decisions/README.md`](decisions/README.md)。
>
> **非官方声明**：本治理体系属于社区自治，不声称 DeepSeek 官方认证、官方采用或唯一标准。

## 1. 角色

| 角色 | 职责 |
| --- | --- |
| 提案作者 | 起草、回应异议、维护变更记录 |
| 评审者 | 阅读、提出具体可回应异议 |
| 受影响资产控制者 / Ratifier | 对涉及自己仓库或资产的条款给出确认 |
| Maintainer / 合议人 | 主持评审、合议裁决、维护治理文档 |
| 记录者 | 登记 decisions、会议记录、处置结论 |
| 安全 / 行为联系 | 处理敏感事项，不走公开提案 |

- 权限跟随资产，不跟随组织或知名度；
- 推荐 maintainer 3–7 人，且不得全部来自同一宿主或同一组织；
- 敏感事项中，提案人、决策人、申诉复核人不得为同一人；无独立复核人时暂停或外聘临时复核。

## 2. 提案类型与归属

| 类型 | 归属 | 目录 / 文件 |
| --- | --- | --- |
| 生态治理 / 流程 / 总入口 | 本仓库 | `governance/`、`rfc/0000-governance.md` |
| 社区生态 RFC | 本仓库 | `rfc/NNNN-*.md` |
| 公共协议提案 | dsh-std | `dsh-std/docs/proposals/`，索引在本仓库 |
| TUI 实验 / 产品准入 | 本仓库 | `proposals/tui-proposals.md`（`TUI-PROP-*`） |
| Adapter Note | 本仓库 | `adapters/*.md` |
| Registry 条目 | 本仓库 | `registry/` |
| Conformance 与证据 | 本仓库 | `conformance/` |
| 决策 / 反馈处置 | 本仓库 | `decisions/` |

## 3. 状态与生命周期

```text
Idea / Issue
   ↓
Draft
   ↓
Discussion
   ↓
Review / Ratification
   ↓
Accepted / Rejected / Withdrawn
   ↓
Implementation
   ↓
Candidate
   ↓
Stable
   ↓
Deprecated / Superseded
```

| 状态 | 含义 |
| --- | --- |
| `Draft` | 只是草稿，不代表社区立场 |
| `Discussion` | 公开征求意见，可修改 |
| `Review` / `Awaiting Ratification` | 评审期，等待实质异议结束 |
| `Accepted` | 方向已接受，可开始落地 |
| `Rejected` / `Withdrawn` | 终态 |
| `Candidate` | 规范、资产、测试基本稳定，等待多实现验收 |
| `Stable` | 经治理批准并具备独立 conformance evidence |
| `Deprecated` / `Superseded` | 弃用 / 被取代 |

> TUI 实验方向可长期停留在 `Experimental`，不得因为“已实现”就自动升级为 `Stable`。

## 4. 评审期与决策方式

| 类型 | 最短公开评审期 | 决策 |
| --- | --- | --- |
| 常规文档 / 元数据 / 可逆维护 | 不需要 RFC，维护者 review 即可 | 记录回滚方式 |
| 跨项目 / 共享契约 / registry / conformance | 72 小时（社区默认）至 14 天（正式 RFC） | lazy consensus + 受影响资产控制者确认 |
| 公共协议语义 / breaking change | **14 天起** | lazy consensus + maintainer 合议兜底；不能静默通过 |
| 高风险事项（命名空间、安全、治理、品牌、移除） | 不得因沉默通过 | 必须由受影响资产控制器显式确认；有独立复核 |

- 评审期从完整提案到达约定渠道后开始；
- 收到实质异议则暂停计时；
- “沉默 = 同意”的前提是讨论足够可见：必须在 `dsh-ecosystem-spec` 有可抵达的入口。

## 5. 异议与申诉

1. 异议必须公开、具体、可回应：指出哪条设计、造成什么后果、建议替代方案。
2. 作者对每条实质异议给出处置并登记到 `decisions/`。
3. 合议裁决必须公开理由。
4. 对合议不服，可在公示后 14 天内公开申诉；由未参与原裁决的 maintainer 复核一次，复核为终局。
5. 申诉期间不冻结普通可逆工作，但不得推进被争议的高风险动作。

## 6. 利益冲突

- 评审与自己直接相关的 RFC 时，必须在讨论中声明利益关系；
- 声明后仍可讨论，但不参与该议题的合议裁决；
- 作者是 maintainer 时，对自己的 RFC 不行使合议裁决权。

## 7. 表述边界

本体系所有文档必须标注“社区 Draft / 社区生态入口，非官方标准”：

- 不得使用“官方标准规定”“dsh 官方认证”“TUI 验证所以安全”“所有 dsh 插件都必须遵守”等表述；
- 参考实现、某宿主、市场或导航站只能提供 evidence，不能自我认证；
- registry / 市场可以有多种共存；listing 不等于 endorsement；
- 官方实现可记录为 “observed / upstream implementation”，不得写成“已通过本 spec 官方认证”；
- 对官方只请求“变更可见性 / 命名空间不冲突 / 可选参与治理”，不请求官方冻结内部接口或停止演进。
