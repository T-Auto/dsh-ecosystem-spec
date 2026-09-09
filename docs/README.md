# 文档导航

> `dsh-ecosystem-spec` 是 DSH 社区生态互操作、索引、校验与治理的**入口**。
> 本仓库不声称 DeepSeek 官方认证或官方采用，也不声称自己是唯一标准。

协议正文与实现正文**不在本仓库**：它们挂载在 [`../vendor/`](../vendor/README.md) 下，
由各自的上游仓库维护。本目录只放说明性文档。

## 文档地图

| 路径 | 内容 |
| --- | --- |
| [`../README.md`](../README.md) | 仓库首页：定位、生态地图、挂载表、导航 |
| [`overview.md`](overview.md) | 生态总览：四层模型、角色边界、去中心化原因、当前收录 |
| [`directory-guide.md`](directory-guide.md) | **目录规范与新增挂载流程**：东西该放哪、要改哪些文件、CI 强制什么 |
| [`examples/dsh-dpx.md`](examples/dsh-dpx.md) | `dsh-dpx` 作为 `dsh-distribution` 标准管理范例的完整说明 |
| [`../registry/README.md`](../registry/README.md) | 机器可读索引：协议 / 范例 / Profile |
| [`../vendor/README.md`](../vendor/README.md) | 挂载区：类别、当前挂载、新增与升级流程 |
| [`../governance/README.md`](../governance/README.md) | 治理：权威归属、状态词、基线升级、命名空间、证据 |
| [`../decisions/README.md`](../decisions/README.md) | 决策记录（ADR）索引与模板 |
| [`../CONTRIBUTING.md`](../CONTRIBUTING.md) | 贡献规则：分区纪律、PR 要件、禁止顺手规范化 |
| [`../old/README.md`](../old/README.md) | 重构前的全量归档（只读，迁移期权威副本） |

## 维护约定

- **不在 `docs/` 重复协议正文**：公共协议语义以挂载的协议仓库固定 revision 为
  normative source；
- **一例一文件**：范例实现各写一份 `docs/examples/<id>.md`，协议条目在
  `overview.md` 分节说明；
- **表述红线**：所有文档保持“社区 Draft / 社区生态入口，非官方标准、非官方认证、
  非唯一标准、参考实现不是标准、capability/permission 不是安全边界”的表述；
- **链接必须可解析**：文档中的相对链接由
  [`../scripts/verify-structure.mjs`](../scripts/verify-structure.mjs) 在 CI 中校验。
