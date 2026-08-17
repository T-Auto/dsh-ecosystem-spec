# Community Consensus v0.1

**Status:** Draft / Experimental  
**Scope:** dsh 社区插件互操作最低公共契约  
**Authority:** 社区 Draft；非 dsh 官方标准  
**Normative assets:** `schemas/`、`registry/registry-0.1.json`、`registry/permissions-0.1.json`、`conformance/fixtures/`、`conformance/tests/run.js`

> 本文是可执行的实验性 contract 草案。未达到 Candidate 前，不得宣称 Stable、官方认证或安全隔离。

## 1. 规范效力和术语

本版本只定义 Community v0.1 core。RFC 0002、0003、0004 的延期内容不是 core contract；它们不得被实现以“默认兼容”的名义偷偷加入。

规范性关键字：**MUST / 必须**、**MUST NOT / 禁止**、**SHOULD / 应**、**SHOULD NOT / 不应**、**MAY / 可以**。没有这些关键字的句子是说明性文字。

每一项可执行要求都有稳定 ID，并应在 `conformance/requirements-v0.1.json` 中映射到 schema、fixture、测试和失败展示。

## 2. Manifest

### C-001 唯一发现入口

插件包根目录 MUST 提供唯一的 `dsh-plugin.json`。宿主、市场和验证器 MUST NOT 使用其他文件名作为 Community v0.1 的发现入口；其他 manifest 文件只能属于非标准生态。

Manifest MUST 是静态 JSON。宿主 MUST NOT 执行插件代码、访问网络或加载依赖后才能回答插件身份、依赖、权限或兼容性问题。

### C-002 声明分类

Manifest MUST 将声明分成五类，不能把不同语义压进一个泛化字段：

- `requires`：依赖的 Host capability；
- `permissions`：请求的授权；
- `provides`：插件间 service 能力；v0.1 MUST NOT 提供；
- `contributes`：静态贡献元数据；
- `subscriptions`：订阅的事件。

v0.1 的 schema 拒绝 `requires.services` 和 `provides`。插件间 service 归 RFC 0003。

### C-003 必填身份字段

Manifest MUST 符合 `schemas/dsh-plugin.schema.json`，并包含：

- `$schema = https://dsh.community/schemas/dsh-plugin-0.1.json`；
- 稳定、全局唯一的 `id`；
- 插件 `version`；
- `manifestVersion = 0.1`；
- 要求的 `apiVersion`；
- 相对包根的 `entry`；
- license 和 source repository。

artifact 若被用于任何 conformance claim，MUST 使用 SHA-256 digest，并绑定被验证的发布产物字节范围。digest 不证明发布者身份；签名或 attestation 是独立能力。

## 3. Host Descriptor

### C-010 可解析宿主描述

宿主 MUST 发布符合 `schemas/host-descriptor.schema.json` 的机器可读 Host Descriptor，至少包含 host identity/version、API 版本、每个 contract 的名称/版本/schemaHash/permissions、runtime location、runtime generation、headless 条件、trust level 和平台。

宿主 MUST 精确声明 contract，不能只写“支持 commands”。未知字段或未知 contract MUST fail closed。

`runtimeGenerationId` 是 v0.1 的基础 scope 标识：宿主创建新的独立插件运行环境时生成新的 ID；同一 generation 内的 activation instance 不得因 Presentation attach/detach 自动改变。Runtime/Presentation 的完整分层仍归 RFC 0002。

对 trusted-in-process 宿主，粒度定义如下：一个 runtime generation 对应**一次完整的插件运行时生命周期**——宿主进程启动、或全体插件的整体重载，生成新 ID；单个插件的 activate/deactivate 不产生新 generation。

## 4. Registry

### C-020 权威注册表

Capability 和 event 名称 MUST 来自 `registry/registry-0.1.json`；权限名称 MUST 来自 `registry/permissions-0.1.json`。每个 contract MUST 有版本、schema 引用和不可变 SHA-256 schema hash。

标准名称为 `domain.resource[.action]`。组织私有扩展 MUST 使用 `x-org.example.*` 命名空间，并在宿主兼容性展示中标为私有扩展。

## 5. Negotiation

### C-030 纯函数协商

协商器 MUST 实现：

`Manifest × Host Descriptor -> Decision`

Decision MUST 是机器可读对象，`decision` 只能为：

- `compatible`：required contracts 和所需授权均满足；
- `compatible_degraded`：required 满足，optional 缺失，且每个缺失的 optional 都声明了 fallback；
- `waiting_authorization`：contract 可用但当前授权未授予；
- `rejected`：required contract/schemaHash 不可用，或声明非法；
- `unknown`：引用的 contract 版本或 registry 版本无法判断。

required 缺失或 schemaHash 不匹配 MUST `rejected`，不得静默降级。optional 缺失只可 `compatible_degraded`，且必须返回缺失项。权限不足优先返回 `waiting_authorization`，不得伪装成 compatible。

**fallback 是 optional 引用的必填字段**：它声明缺失该 capability 时的降级行为。没有 fallback 的 optional 声明是非法声明（`INVALID_MANIFEST`），不进入协商——"可选"必须有书面的降级答案，否则宿主无从判断降级是否安全。

**`unknown` 的触发条件只有两种**：(a) 引用的 contract 名字存在于 registry、但请求的 version 不在 registry 中；(b) registry 本身的版本高于协商器支持的版本，协商结果无从判断。注意区分：引用的 contract **名字**不在 registry 属于非法声明（`INVALID_MANIFEST` → `rejected`），只有 version 层面的无法判断才是 `unknown`。

一个 manifest 同时命中多种情况时，决策优先级为：`unknown` > `rejected` > `waiting_authorization` > `compatible_degraded` > `compatible`——无法判断优先于拒绝，拒绝优先于待授权，不得用较低优先级的结果掩盖较高优先级的问题。

标准错误码至少包括 `REQUIRED_CONTRACT_UNAVAILABLE`、`PERMISSION_NOT_GRANTED`、`UNKNOWN_CONTRACT`、`DUPLICATE_CONTRIBUTION_ID`、`INVALID_MANIFEST`。

## 6. v0.1 Core Contracts

### C-040 `storage.local`

该能力提供插件私有 namespace。调用者只能访问自身 plugin ID namespace；跨插件读写 MUST 拒绝。读写分别需要 `storage.local.read` 和 `storage.local.write`，默认拒绝、可撤销。

宿主 MUST 定义输入/输出、并发、quota、错误码、deactivate/uninstall/purge 行为。v0.1 实现至少必须做到：重复 cleanup 幂等、secret 不进入普通日志、grant 撤销后新调用立即失败。完整 API schema 由 registry 条目引用的 contract profile 补充。

### C-041 `commands`

v0.1 只支持 flat action leaf：一个全局 command ID 对应一个 handler，不支持 command tree、交互式 prompt 或流式输出。command ID MUST 全局唯一；重复注册 MUST 拒绝后来的 contribution，并返回 `DUPLICATE_CONTRIBUTION_ID`，绝不能由加载顺序仲裁。

Command descriptor 至少包含 `id`、`title`，可含 description。调用权限限定到声明的 command ID，并使用一次 invocation 上下文；不得在 activation 时缓存单一 Presentation。

### C-042 `messages.observe`

该事件只能观察，不得修改或阻断消息。事件 MUST 符合 `schemas/messages-observe-envelope.schema.json`，包含 `eventType`、`eventVersion`、`eventId`、scope 内单调 `sequence`、封闭枚举 `privacyClass`、裁剪摘要和不可变 payload。

`privacyClass` 仅允许 `public`、`internal`、`sensitive`。未知值 MUST 丢弃并记录非敏感错误。`sensitive` 事件默认不向插件发送，除非当前 scope 有 `messages.observe.read` grant；宿主 MUST 在发送、重连和订阅变更时重新检查授权。宿主 MUST 按 scope 隔离事件，不得跨 session/tenant 传送；不得把完整消息正文、凭据或 token 写入普通日志。

## 7. Lifecycle

### C-050 确定性生命周期

v0.1 使用 eager activation：

```text
discover -> validate -> negotiate -> authorize -> activating -> active
  -> deactivating -> disposed
```

每个 activation MUST 具有 `pluginId + activationInstance + runtimeGenerationId`。正常关闭为 best-effort，但 cleanup MUST 可重复执行；宿主 MUST 捕获 activation/deactivation 异常并继续维护 Broker 生命周期。重复 activation 必须得到明确的复用或拒绝结果，不得产生未归属资源。

## 8. Broker 和 Effect Ledger

### C-060 可归属效果

标准注册效果 MUST 归属到具体 plugin ID 和 activation instance。Ledger MUST 符合 `schemas/effect-ledger-record.schema.json`，至少包含单调序号、时间、runtime generation、操作、稳定 resource ID、结果和必要的 replacement relation。

Ledger MUST NOT 记录消息正文、凭据、token 或 secret。需要关联时只能记录不可逆 digest 或引用 ID。`cleanup-failed` MUST 保留可重试状态；宿主不得在未释放时报告完全 cleanup。

## 9. Trust Model

### C-070 受信任进程边界

v0.1 是 `trusted-in-process`。capability/permission 用于兼容性、授权提示、审计和治理，**不是技术安全边界**。插件代码在技术上可能绕过 Broker 并继承宿主进程权限。

TUI 和其他宿主 MUST 在安装、授权和市场展示中明确该事实。通过 manifest 或 conformance 校验 MUST NOT 表述为“安全插件”“无漏洞”或“权限已被技术隔离”。真正的进程/realm/IPC 隔离归独立 RFC。

## 10. 明确延期

以下内容不属于 Community v0.1 core：`before-*` 修改/取消事件、完整 Runtime/Presentation/Invocation/Transport/Control 分层、command tree、plugin-to-plugin service、完整 provenance、按需激活、sandbox、跨端声明式 UI、`net.*`/`fs.*`/session write、market certification、lockfile/modpack。

其中 `before-*` 修改/取消事件由 RFC 0005（Decision Events）认领。即使实现走在标准前面，也必须先遵守其方向性约束：**拦截类事件的订阅必须显式授权、默认拒绝**——否则权限模型落地时，已成事实的插件会全部卡在授权上。

## 11. Candidate 验收

进入 Candidate 前 MUST 具备：2 个独立宿主 integration evidence、3 个示例插件、相同 headless 场景、合法/非法 fixtures、协商/授权/生命周期/异常/重复激活/清理测试。单一参考实现不能定义标准。
