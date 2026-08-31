# Decisions — 讨论反馈与决策记录

> 本目录用于登记社区讨论中的实质意见、处置、落点与复审信息。
> 目的是让讨论可追溯：谁提了什么、如何处置、落到哪个规范/文件、何时复审。

## 编号规则

- 社区决策：`D-NNNN`
- 外部社区提案处置：可沿用外部 `P-NNNN` → `D-NNNN`
- TUI 专属实验：可在 `proposals/tui-proposals.md` 内用 `TUI-PROP-NNN` 记录

## 建议字段

```text
# D-0000: <决策标题>

- Status: proposal / ratified / implemented / paused / reversed / expired / superseded
- Date:
- Scope:
- Proposal and evidence:
- Alternatives:
- Reasons:
- Decision-maker or ratifier:
- Conflicts and recusals:
- Objections:
- Owner and deadline:
- Rollback:
- Review or expiry:
- Supersedes:
```

## 讨论处置记录格式

每条实质意见登记为：

```text
意见（提出者、链接）
处置（已采纳 / 限定采纳 / 独立 RFC / Adapter 实验 / 不属可移植核心 / 已记录 / 拒绝+理由）
落点
```

## 纪律

- **新评论不静默改写 Draft。** 意见先进入评审，再更新处置记录。
- 作者必须回应每一条实质异议；只表达情绪或“不喜欢”不计为实质异议，但会记录。
- 有未决实质异议时，不得进入下一阶段，也不得向官方提交。
- 官方反馈同样进入本目录；不得把“提交给官方审阅”描述成“官方已经接受”。
