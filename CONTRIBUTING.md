# Contributing

## 1. 你应该把什么提交到哪里？

如果你是在修改跨宿主公共 contract：提交 `rfc/`，经过治理后再进入 `spec/`。

如果只是 TUI 市场准入要求：提交 `proposals/` 或 TUI admission 文档修改，并使用 `TUI-*` 标识。

如果是 dsh / Cordis 某版本怎么适配：提交 Adapter note，不修改公共 contract。

如果是如何测试：提交 `conformance/`。

## 2. PR 标题

推荐：

```text
RFC: clarify required capability semantics
TUI: add remote admission requirement
Conformance: add cleanup fixture
Registry: add messages.observe 0.1
Governance: define proposal graduation
```

## 3. PR 必须说明

每个规范变更 PR 至少写：

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

## 4. 禁止“顺手规范化”

一次 PR 不应同时：

- 修改 community contract；
- 加入 TUI 专有要求；
- 改 registry；
- 修改市场文案；
- 修改 reference implementation。

除非每个变更之间存在明确依赖，并分别列出影响。

## 5. 提案晋级

推荐流程：

```text
Idea
 ↓
TUI Proposal / RFC
 ↓
Experimental implementation
 ↓
Fixture
 ↓
Conformance evidence
 ↓
Review
 ↓
Candidate
 ↓
Stable
```

只有 Stable contract 才能被其他实现当作默认长期依赖。

## 6. 对 dsh 官方的态度

本项目欢迎官方审阅、采用、反对、分叉或暂不处理。

任何参与者不得把“提交给官方审阅”描述为“官方已经接受”。

本项目的价值来自可验证的公共 contract，而不是来自官方背书。
