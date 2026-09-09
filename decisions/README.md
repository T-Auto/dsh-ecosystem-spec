# 决策记录（ADR）

本目录记录**本仓库自己的**结构性决策：收录范围、目录规范、索引形状、校验规则、
挂载升级时机等。协议语义的决策属于协议上游仓库，不在本目录。

## 1. 命名与格式

```text
decisions/
├── README.md
├── 0001-<slug>.md
└── 0002-<slug>.md
```

每条记录包含：

```text
# NNNN <标题>
Status: Proposed | Accepted | Superseded | Deprecated
Date: YYYY-MM-DD
Context: 背景与约束
Decision: 决定了什么
Consequences: 影响、代价、需要同步修改的文件
Supersedes / Superseded by: 关联记录
```

## 2. 当前记录

| 编号 | 标题 | 状态 |
| --- | --- | --- |
| [0001](0001-remove-legacy-archive.md) | 移出重构前的 TUI 时代归档（删除 `old/`） | Accepted |

## 3. 什么时候需要写

- 新增或重命名顶层目录；
- 改变 `registry/` 的索引形状或状态词；
- 改变类别与挂载路径的映射；
- 收录范围变化（新增一类资产、移除挂载）；
- 改变 CI 强制规则。

日常新增一条挂载、写一份范例说明**不需要** ADR——按
[`../docs/directory-guide.md`](../docs/directory-guide.md) 走即可。
