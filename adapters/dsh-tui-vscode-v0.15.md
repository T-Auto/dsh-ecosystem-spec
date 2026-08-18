# Adapter Note — dsh-tui-vscode (VS Code companion) v0.15

**Status:** Draft / Experimental
**Spec version:** community-v0.15
**Host:** dsh-TUI 0.7.0+ / Cordis 4.x profile; VS Code Extension API ^1.90.0
**Plugin:** `com.baobaolaodie.dsh-tui-vscode` (pilot declaration)

## 定位

dsh-tui-vscode 是 dsh-TUI 的 VS Code companion 扩展。它在 dsh 生态里的角色是“启动/恢复 dsh-TUI 会话的入口提供者”，而不是一个独立的 Cordis 运行时插件。

本 Note 记录 dsh-ecosystem-spec v0.15 的 manifest 概念如何映射到该仓库现有实现，以及当前试点声明与规范之间的已知偏差。

## Contract 映射

| Community v0.15 概念 | dsh-tui-vscode 现状 |
| --- | --- |
| `facets.host.entry` | `out/extension.js`（VS Code 扩展入口；**非 dsh 宿主可执行入口**，见偏差 D-1） |
| `facets.host.apiVersion` | `v1alpha1`（试点值；尚未被 dsh-tui 运行时协商） |
| `requires.contracts` | `commands.dsh/v1alpha1` + `Command`（启动/恢复命令的声明） |
| `permissions` | `commands.invoke`（单条；scope = 插件命名空间，覆盖 start/resume；dsh-std 投影按 action 去重，同一 action 不允许重复声明） |
| `contributes.commands` | `dsh-tui-vscode.start` / `dsh-tui-vscode.resume` |
| `subscriptions` | 无（当前不订阅 messages.observe 等事件） |
| Host Descriptor | 官方示例已发布：`registry/host-descriptor.tui.example.json`（`facetApiVersions=["v1alpha1"]`，storage/commands/messages）；真实 dsh-tui host 未发布（见 D-2） |
| effect ledger | 未实现；当前通过 VS Code 终端/会话文件系统读写，无标准 ledger |

## 已知偏差

- **D-1 entry 不可被 dsh 直接加载**：`out/extension.js` 是 VS Code Extension Host 入口，不能由 dsh/Cordis 直接加载。当前 `dsh-plugin.json` 是“声明性试点”，不是可执行插件。
- **D-2 无真实 Host Descriptor**：本规范仓库已发布官方示例 `registry/host-descriptor.tui.example.json`（`facetApiVersions=["v1alpha1"]`，contracts=storage/commands/messages，hostVersion `0.1.0-experimental`），但 dsh-tui 运行时仍未发布可验证的“真实” Host Descriptor；本扩展自身也无法单独声明宿主能力。
- **D-3 无 effect ledger / lifecycle 实现**：当前没有 activation instance、runtime generation、effect ledger 等 v0.15 生命周期实体。
- **D-4 与 Cordis bundle 双轨并存**：实际可运行层仍是 `package.json` 的 `dsh.bundle` + `cordis.patch.yml`；`dsh-plugin.json` 是额外试点声明，两者尚未统一。
- **D-5 证据等级为 Declared**：试点 manifest 已通过 dsh-std v0.15 的 schema + 语义校验（`parseManifest` → `projectManifest` → `manifestDefinitions.validate`），并对官方示例 Host Descriptor（`registry/host-descriptor.tui.example.json`）协商出 **`compatible`**（无 required 缺失、无 denied permission）。但因 entry 不可被 dsh 直接加载（D-1）且真实 host 协商未发生，证据等级仍为 `Declared`，不能声称 `Tested` / `Verified`。

## 证据

- 仓库：https://github.com/baobaolaodie/dsh-tui-vscode
- 分支：`feat/dsh-ecosystem-spec`
- `dsh-plugin.json`：该仓库根目录（试点声明）
- 上游 conformance 核对：本仓库（HEAD，2026-08-18）+ 固定 `vendor/dsh-std` submodule；以 `conformance/tests/run.js` 同款逻辑对试点 manifest 重新执行校验 → **`compatible`**（结构校验 + 语义校验 + 协商全部通过）。
- 注：`npm run test:standalone` 可在独立 checkout 下完整运行本仓库 conformance suite（standalone 回退路径）；`pnpm test` 仅限 dsh-TUI workspace 内使用。
- 该仓库 CI：`npm test` / `npm run test:e2e` 覆盖 VS Code 扩展行为，不覆盖 v0.15 conformance。

## 收敛计划

1. 等 dsh-tui 本体发布真实 Host Descriptor；
2. 等 Cordis 或 dsh loader 支持读取 `dsh-plugin.json` 作为包身份层；
3. 再决定 entry 是否需要改为独立的 Node/Cordis 入口；
4. 届时补 effect ledger 与 lifecycle 映射，并从 `Declared` 升级到更高证据等级；
5. 本 Note 作为第一篇 Adapter Note 提交上游 `adapters/`（作为社区首个 VS Code companion 适配参考）。
