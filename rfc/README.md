# RFC / 提案索引

> 本目录是 `dsh-ecosystem-spec` 的 RFC 与跨仓库提案索引。
> 公共协议正文在 `dsh-std/docs/proposals/`；生态治理、Profile、conformance、
> adapter 与 registry 类提案在本仓库 `rfc/` 或 `proposals/`。
> 所有提案均先登记、再评审、后落地。

## 提案类型与编号

| 类型 | 编号 | 位置 |
| --- | --- | --- |
| 社区生态 RFC | `RFC-NNNN` | `rfc/NNNN-*.md` |
| dsh-std 公共协议 | `STD-PROP-NNNN` 或短文件名 | 正文在 `dsh-std/docs/proposals/`，索引在本仓库 |
| TUI 实验 / 准入 | `TUI-PROP-NNN` | `proposals/tui-proposals.md` |
| Adapter Note | `ADAPTER-<host>-<version>` | `adapters/` |
| 外部社区提案 | `P-NNNN` | 若借用外部 community，先 `P-NNNN` 后 `D-NNNN` |

提交顺序：

1. 先发 `P-` / `RFC` 讨论稿，不直接改规范；
2. 讨论收敛后写 `D-` / `decisions/` 决策记录；
3. 再进入实现（schema / fixtures / conformance）；
4. 最后才更新 README、registry、市场等对外展示。

## 状态流

```text
Draft → Discussion → Review → Accepted / Rejected / Withdrawn
      → Implementation → Candidate → Stable → Deprecated / Superseded
```

正式状态只使用：

```text
Draft / Experimental / Candidate / Stable / Deprecated
```

## 现有 RFC 索引

| 编号 | 标题 | 状态 |
| --- | --- | --- |
| [0000](0000-governance.md) | Ecosystem Governance | Experimental |
| [0001](0001-manifest-host-contract.md) | Manifest / Host Contract | Experimental |
| [0002](0002-runtime-presentation-invocation.md) | Runtime Presentation Invocation | Experimental |
| [0003](0003-service-composition.md) | Service Composition | Experimental |
| [0004](0004-provenance-validation.md) | Provenance Validation | Experimental |
| [0005](0005-decision-events.md) | Decision Events | Experimental |
| [0006](0006-tui-contributions.md) | TUI Contributions | Experimental |
| [0007](0007-tui-channel.md) | TUI Channel | Experimental |
| [0008](0008-tui-channel-http.md) | TUI Channel HTTP | Experimental |

## 规范变更 PR 必填字段

规范变更 PR 必须写：

```text
Status:
Scope:
Normative change:
Compatibility impact:
Evidence:
Fixtures:
Conformance impact:
Migration:
Rollback:
```

## 分流原则

1. 修改公共协议语义 → 必须先到 `dsh-std` 提协议提案；本仓库不得“顺手规范化”。
2. 只改 TUI 市场准入、TUI 私有命名空间、TUI 展示策略 → 在 `proposals/` 走 `TUI-*`。
3. 只记录版本适配差异 → Adapter Note，不提案。
4. 只增加验证/证据 → conformance / registry。
5. 治理、角色、评审、表述边界 → governance / RFC 0000。
