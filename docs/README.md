# 文档导航

> `dsh-ecosystem-spec` 是 DSH 社区生态互操作、conformance、registry 与治理的**规范入口**。
> 本仓库不声称 DeepSeek 官方认证或官方采用，也不声称自己是唯一标准。

本文档是仓库内文档的导航页。按读者目标选择入口；协议正文、Profile 规范与
生态事实以各自主管目录为 normative source，不在 `docs/` 重复定义。

## 文档地图

| 路径 | 内容 |
| --- | --- |
| [`README.md`](../README.md) | 仓库首页：定位、四区导览、读者导航、快速验证 |
| [`overview.md`](overview.md) | 生态总览：项目是什么、与 dsh-std / dsh-tui 的关系、协定分层、去中心化原因 |
| [`plugin-admission-and-development.md`](plugin-admission-and-development.md) | TUI 插件准入与开发唯一整合文档：Community 基线、TUI Admission、开发指南、准入清单 |
| [`upstream-analysis/`](upstream-analysis/README.md) | DSH 核心版本变动分析：每次上游变化如何影响 adapter、协议、Profile、conformance（含 [0.1.2-alpha.1](upstream-analysis/dsh-0.1.2-alpha.1.md)、[0.1.2-alpha.2](upstream-analysis/dsh-0.1.2-alpha.2.md)） |
| [`credits.md`](../credits.md) | 规范作者、实现作者、参考实现与早期采用者矩阵 |
| [`plugins.md`](plugins.md) | 旧版插件开发指南迁移说明 |
| [`plugins.en.md`](plugins.en.md) | 英文旧版迁移说明 |

## 四区导览

仓库内容按用途分为四个区域，外加横切治理与事实区：

```text
这是入口          → README / docs/
这是提案与讨论    → rfc/ proposals/ decisions/
这是稳定的协议    → dsh-std/（vendor submodule）
这是具体 Profile  → profiles/dsh-tui/（渐进迁移中；当前 TUI 内容仍在根级 registry/、conformance/、adapters/）

横切区：
治理            → governance/ + GOVERNANCE.md
生态事实         → registry/ + conformance/
历史与信用       → decisions/ + credits/
```

## 维护约定

- **不在 `docs/` 重复协议正文**：公共协议语义以 `vendor/dsh-std` 固定的
  dsh-std revision 为 normative source；Profile 规则以对应 Profile 目录为准。
- **上游分析**：DSH 核心版本变动后，在
  [`upstream-analysis/`](upstream-analysis/README.md) 新增分析文档，使用
  [`template.md`](upstream-analysis/template.md) 填写。
- **表述红线**：所有文档保持“社区 Draft / 社区生态入口，非官方标准、非官方认证、
  非唯一标准、参考实现不是标准、capability/permission 不是安全边界”的表述。
