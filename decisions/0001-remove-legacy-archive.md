# 0001 移出重构前的 TUI 时代归档

Status: Accepted
Date: 2026-09-09

## Context

重构把仓库定位改为**生态入口**：协议正文由 `vendor/` 下挂载的上游仓库承担，
本仓库只做索引、说明、校验与治理。重构第一步曾把旧内容整体移入 `old/` 作为
“迁移期权威副本”，根 README 也一度声明“在这句话被删除之前，请以 /old 的全量备份为准”。

`old/` 实际包含的内容（新树与上游挂载均无对应物）：

- TUI 准入与插件开发整合指南 `docs/plugin-admission-and-development.md`（56 KB）；
- `conformance/`（fixtures、tests、`requirements-v0.15.json`）；
- `registry/`（`registry-0.15.json`、`permissions-0.1.json`、`contracts/*.json`）；
- `protocols/`（`tui-channel`、`tui-contributions`、`profile-definitions`）；
- `schemas/`（conformance-claim、effect-ledger-record、host-descriptor）；
- `adapters/`、`rfc/0000-0008`、`proposals/`、`PLUGIN-ADMISSION-CHECKLIST.md`、
  `SPEC-WRITING-RULES.md`、`scripts/`、`CHANGELOG.md`、以及一个旧 pin 的
  `vendor/dsh-std` submodule。

这些内容在新结构里**没有**被迁移，但完整保存在 git 历史中：归档前的
`d28c267`（内容位于仓库根路径）与分支 `origin/dev`（`f7e1d0e`，基于 `d28c267`）。
`old/` 的跟踪内容只有约 252 KB，工作树里那 100 MB 是它内部 submodule 的
`node_modules`（从未跟踪）。

## Decision

删除 `old/` 目录与它对应的 `.gitmodules` 条目，并同步清理所有引用：

- `README.md`、`docs/README.md`、`docs/directory-guide.md`、`docs/overview.md`、
  `profiles/README.md`、`vendor/README.md`；
- `scripts/verify-structure.mjs`（顶层白名单、Markdown 扫描、归档挂载特例）；
- `.gitattributes`、`.gitignore`。

本仓库**不设归档目录**：过时内容直接删除，需要时从 git 历史取回。

## Consequences

- 顶层目录从此等于“当前有效的层”，不再新旧两套并存；
- 需要取回旧内容时：

  ```powershell
  # 看某个文件
  git show d28c267:docs/plugin-admission-and-development.md

  # 把整份旧内容取到临时目录
  git archive d28c267 | tar -x -C <临时目录>

  # 或直接切到保留完整旧内容的分支
  git switch -c tmp/legacy origin/dev
  ```

- TUI 准入 Profile 的迁移（`profiles/dsh-tui/`）改为**从历史取材**，而不是从工作树取材；
- 若未来需要长期保留历史正文，应作为上游仓库（子协议 / Profile 归属方）的内容存在，
  而不是在本仓库里留一份副本。
