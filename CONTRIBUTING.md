# Contributing

## 1. 你应该把什么提交到哪里？

先看这张表；更细的规则（含“新增一个挂载要改哪些文件”）见
[`docs/directory-guide.md`](docs/directory-guide.md)。

| 你要改的东西 | 提交到 | 注意 |
| --- | --- | --- |
| 公共协议语义（dsh-std / dsh-distribution / 子协议） | **对应上游仓库** | 本仓库只挂载引用，不改语义 |
| 生态收录（新增协议 / 范例 / Profile） | `registry/` + `vendor/` + `docs/` | 一次 PR 只加一类 |
| 本仓库说明文档 | `docs/` | 不重复协议正文 |
| 目录规范与校验规则 | `docs/directory-guide.md` + `scripts/verify-structure.mjs` | 规则与脚本必须同步改 |
| 治理规则 | `governance/` | 结构性决策另补 `decisions/` |
| 产品准入要求 | `profiles/<profile>/` | 用稳定的 `<PROFILE>-*` 编号 |
| 上游 DSH 版本影响分析 | `docs/upstream-analysis/` | 一版一文件 |
| 挂载 revision 升级 | 改动 gitlink | 独立 PR，附升级理由与证据 |
| 范例实现说明 | `docs/examples/<id>.md` | 一例一文件 |

本仓库**不接受**直接提交协议正文、实现代码或 conformance suite——那些属于上游仓库。

## 2. PR 标题

推荐：

```text
Registry: add dsh-skin entry
Mount: pin dsh-distribution to <revision>
Docs: add skin protocol example
Governance: clarify mount upgrade discipline
CI: check registry against gitlinks
Profile: add TUI admission section
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

新增挂载或范例的 PR 至少写：收录理由、类别判定、状态出处（上游声明）、
需要同步修改的索引与文档、以及 `node scripts/verify-structure.mjs` 的本地结果。

## 4. 禁止“顺手规范化”

一次 PR 不应同时：

- 新增或改动挂载（`.gitmodules` / gitlink）；
- 修改 `registry/` 索引；
- 改写 `docs/` 说明文档；
- 升级挂载 revision；
- 修改治理规则或 CI 校验规则。

除非每个变更之间存在明确依赖，并分别列出影响。

## 5. 提案晋级

推荐流程：

```text
Idea
 ↓
Upstream proposal / RFC（在对应协议仓库）
 ↓
Experimental implementation（范例实现仓库）
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

只有 Stable contract 才能被其他实现当作默认长期依赖。本仓库只登记上游结论，
不代替上游做晋级判断。

## 6. 对 dsh 官方的态度

本项目欢迎官方审阅、采用、反对、分叉或暂不处理。

任何参与者不得把“提交给官方审阅”描述为“官方已经接受”。

本项目的价值来自可验证的公共 contract，而不是来自官方背书。
