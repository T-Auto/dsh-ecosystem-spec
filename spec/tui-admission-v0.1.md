# dsh-TUI Ecosystem Plugin Admission v0.1

**Status:** Experimental / Product Policy  
**Authority:** dsh-TUI 生态维护团队  
**Scope:** 进入 dsh-TUI 插件市场、生态目录或推荐集合的插件

> 本文不是 dsh 官方标准。它是在 Community Consensus 基础上的 TUI 产品准入规则。生效日期保持由 TUI 发布流程管理，本文件不规定日期。

## 1. 规范性要求

本文件中的要求 ID 是稳定引用。硬要求使用 **MUST / 必须**，建议使用 **SHOULD / 应**，可选项使用 **MAY / 可以**。完整检查表见 `PLUGIN-ADMISSION-CHECKLIST.md`，公共 contract 追踪见 `conformance/requirements-v0.1.json`。

### TUI-PKG-001 包身份

插件进入 TUI 目录前 MUST 在包根目录提供唯一 `dsh-plugin.json`，且通过 community v0.1 manifest schema。必须有稳定 id、合法版本、license、source repository；用于 Verified 的产物 MUST 有 SHA-256 artifact digest。

### TUI-PKG-002 声明完整

required/optional capability、permission、subscription 和 contribution MUST 全部静态声明并可在 registry 中解析。v0.1 MUST NOT 声明 `provides` 或 `requires.services`。contributes command ID 冲突 MUST 被拒绝。

### TUI-HOST-001 宿主描述

每个 TUI 发布版本 MUST 提供符合 `schemas/host-descriptor.schema.json` 的 Host Descriptor，精确列出 API、contract hash、permission、runtime location、generation、headless、trust level 和平台条件。不得用 `hostType = tui` 代替这些字段。

### TUI-RUN-001 远程确定性

插件 MUST NOT 假定运行机器有浏览器、GUI 或等同于用户交互机器；MUST NOT 将 Remote/local 或 Presentation 存成激活时的单一全局状态。一次 command invocation 的 Presentation capability 若被使用，必须随调用上下文传递。

remote attach 是当前 TUI profile 的测试场景，不是 Community v0.1 core 的自动承诺。声明支持 remote attach 的插件 MUST 通过 local runtime + TUI、remote runtime + TUI、attach/detach 和多 Presentation 场景测试。

### TUI-RUN-002 受信任进程提示

TUI 市场、安装和授权界面 MUST 显著展示：当前插件运行在 trusted-in-process 模式；permission grant 是兼容性/治理/审计记录，不是 OS 级技术隔离；插件可能继承宿主进程权限。拒绝某项声明权限不能承诺阻止恶意同进程代码访问系统资源。

### TUI-OBS-001 溯源

TUI Verified MUST 能从 command、subscription、ledger resource 和异常反查到 plugin ID、activation instance 和 runtime generation。Ledger MUST 遵守公共 schema，禁止记录 secret/credential/token/消息正文。

### TUI-OBS-002 清理

TUI Verified MUST 对 deactivate、uninstall、purge 区分结果：

- `deactivate`：停止本次 activation、订阅和 Broker 资源；
- `uninstall`：阻止再次激活并释放注册资源，保留策略明确的数据；
- `purge`：在用户确认后删除插件私有数据和可删除缓存。

cleanup 失败 MUST 进入可重试状态并展示残留资源；未完成清理不得显示“完全卸载”。grant、subscription、Broker resource 必须由宿主撤销；插件数据删除策略必须明确。

### TUI-DEP-001 依赖闭包

进入 `Reproducible` 前，插件依赖闭包 MUST 可计算，且每个发布产物、native binary、生成产物和锁定依赖都有 digest 或明确不可复现原因。digest 只证明字节完整性，不证明发布者身份。

### TUI-CLAIM-001 验证声明

任何 TUI claim MUST 绑定 `conformance-claim.schema.json` 所需的 community spec version、Host Descriptor digest、artifact digest、suite version、evidence level、result 和测试时间。不得将 Declared、Verified 或 Reproducible 表述为 Secure、官方认证或无漏洞。

## 2. 分级模型

兼容性、验证和限制是三个独立维度，不是一个互斥枚举：

- `compatibilityDecision`：`compatible` / `compatible_degraded` / `waiting_authorization` / `rejected` / `unknown`；
- `verificationLevel`：`Declared` / `Parsed` / `Negotiated` / `Tested` / `Observed` / `Attested`（与 `conformance/README.md` 的 evidence ladder 一致，claim 中机器可读）；
- `restrictions[]`：例如 `headless-only`、`remote-unsupported`、`experimental-contract`。

**"TUI Verified"** 在本文中是市场展示标签，不是独立 evidence level：它表示 `verificationLevel ≥ Tested` 且绑定的 claim 未过期、未撤销。本文 TUI-PKG-001、TUI-OBS-001、TUI-OBS-002 和 §4 中的 "Verified" 均按此定义解读。

市场可以为用户显示组合状态，但不得把 `Declared` 自动升级为 `Verified`，也不得把任何等级升级为 `Secure`。

## 3. v0.1 Command 和交互边界

Community v0.1 仅支持 flat action leaf，不提供 command tree、交互式 prompt 或流式输出。TUI 可在独立实验 profile 中定义 command tree 和 ephemeral presentation channel，但必须标为 `experimental-contract`，不能作为 community v0.1 兼容的必要条件。

登录、授权、device code、URL、QR 和临时确认等交互不得在 activation 时绑定某个客户端。未来的标准化 invocation contract 应按调用传递 Presentation capability；在该 contract 稳定前，TUI 实现必须提供明确的显式入口或拒绝无法呈现的操作。

## 4. 影响与溯源展示

TUI 的 Verified 展示 SHOULD 让用户在安装前看到新增 command、订阅、依赖、申请权限、native/build step、patch/override 声明和 artifact digest；运行中看到 activation instance、资源所有者、异常来源和 cleanup 状态；卸载后看到残留、回滚和复原结果。

这些展示不能把“声明”冒充“观察到的事实”。证据等级定义以 `conformance/README.md` 为准。

## 5. 社区边界

TUI 规则变化 MUST 使用 `TUI-*` ID，不覆盖 Community Consensus；必须在变更记录中说明影响的 TUI profile、兼容性变化和迁移内容。TUI policy 不能自动成为其他宿主强制要求。
