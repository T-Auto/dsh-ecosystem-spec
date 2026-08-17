# dsh-TUI Experimental Proposals

**Status:** Experimental / Non-normative unless separately approved

本文记录 dsh-TUI 团队主动提出、希望未来进入 TUI 生态或 Community RFC 的实验方向。Proposal ID 是稳定引用；完成退出条件前不得移动到 `spec/community-consensus-*`。

## TUI-PROP-001 Reference Host / Conformance Host

**Status:** Experimental  
**Reason for TUI-specific scope:** TUI 希望提供第一个真实 Host conformance evidence，但不能自我认证。  
**Community dependency:** Community v0.1 schemas、registry、fixtures、claim。  
**Experimental capability name:** `x-ccch1mneyyy.tui.conformance-host`  
**Entry criteria:** Host Descriptor schema、测试 runner、至少一组合法/非法 fixture 可运行。  
**Exit criteria:** 两个独立 integration 和三个示例插件通过同一 headless suite，结果绑定 Host Descriptor/artifact digest。  
**Rollback plan:** 移除 TUI market 的 conformance claim 展示，保留原始测试日志，不影响插件运行。

覆盖 manifest、negotiation、lifecycle、event envelope、command registration、cleanup、ledger 和 invocation snapshot。

## TUI-PROP-002 Runtime Determinism

**Status:** Experimental  
**Reason for TUI-specific scope:** 远程工作区需要可观察、可复现的 runtime identity。  
**Community dependency:** v0.1 的 runtime generation、activation instance、artifact/claim schema。  
**Experimental capability name:** `x-ccch1mneyyy.tui.runtime-determinism`  
**Entry criteria:** 定义 Runtime ID、Generation、artifact digest、dependency lock、environment fingerprint、activation set 的数据结构。  
**Exit criteria:** 同一 generation 的重复启动产生相同 activation plan，并通过跨重启 fixture。  
**Rollback plan:** 停止生成 deterministic claim，回退到普通 Host Descriptor，不删除已有 ledger。

## TUI-PROP-003 Provenance-first UI

**Status:** Experimental  
**Reason for TUI-specific scope:** 溯源展示是 TUI 产品工作流，不是跨宿主渲染 contract。  
**Community dependency:** effect ledger、claim evidence、plugin/activation ownership。  
**Experimental capability name:** `x-ccch1mneyyy.tui.provenance-view`  
**Entry criteria:** ledger record schema 可验证，且无 secret/credential/token/正文泄露。  
**Exit criteria:** command、resource、异常和 cleanup 状态可从 UI 反查到 plugin/activation/runtime generation，并通过隐私测试。  
**Rollback plan:** 禁用 UI 查询入口，不停止 ledger 写入和清理能力。

## TUI-PROP-004 Reproducible Workspace

**Status:** Experimental  
**Reason for TUI-specific scope:** lockfile、安装复现和 workspace 迁移属于 TUI packaging/product 层。  
**Community dependency:** artifact digest、claim schema、runtime descriptor。  
**Experimental capability name:** `x-ccch1mneyyy.tui.reproducible-workspace`  
**Entry criteria:** 能计算依赖闭包并记录插件、配置、权限 grant 和产物 digest。  
**Exit criteria:** 新 runtime/container 能按 lock 复原同一 activation set，失败项有明确原因。  
**Rollback plan:** 回退到不可复现的普通安装并显式撤销 Reproducible 标记。

## TUI-PROP-005 Remote Presentation Snapshot

**Status:** Experimental  
**Reason for TUI-specific scope:** Runtime 与 Presentation 的调用快照属于尚未稳定的远程控制 contract。  
**Community dependency:** Community v0.1 flat command 和 TUI remote-first admission。  
**Experimental capability name:** `x-ccch1mneyyy.tui.presentation-snapshot`  
**Entry criteria:** invocation 数据结构包含 presentation capabilities、runtime capabilities、authorization context、deadline、cancellation。  
**Exit criteria:** 多 Presentation attach、detach、切换 Runtime 和授权撤销场景行为确定，并有 headless fixture。  
**Rollback plan:** 禁用需要该能力的 experimental commands，保留显式 CLI fallback 或返回标准拒绝原因。

## TUI-PROP-006 Experimental UI Contract

**Status:** Experimental  
**Reason for TUI-specific scope:** `page -> layer -> slot -> component` 是 TUI/GUI/WebUI adapter 设计，不是当前 core UI contract。  
**Community dependency:** v0.1 static contribution 和 effect ownership。  
**Experimental capability name:** `x-ccch1mneyyy.tui.ui-kit`  
**Entry criteria:** 定义渲染无关 vnode/state schema、slot 冲突、生命周期和清理规则。  
**Exit criteria:** 至少 TUI 与另一个 presentation adapter 通过同一组件 fixture，且不会把 UI implementation API 泄漏到 Community core。  
**Rollback plan:** 停止加载 experimental UI contributions，释放其 ledger 资源，保留 flat commands。

## TUI-PROP-007 Experimental Service Composition

**Status:** Experimental  
**Reason for TUI-specific scope:** provider 组合会改变插件依赖和冲突仲裁，必须先形成独立 Community RFC。  
**Community dependency:** RFC 0003；v0.1 默认拒绝 `provides` / `requires.services`。  
**Experimental capability name:** `x-ccch1mneyyy.tui.service-composition`  
**Entry criteria:** 定义 cardinality、selection、health、replacement、conflict plan、shutdown/cleanup 和 deterministic composition。  
**Exit criteria:** provider 冲突、替换、故障和并发场景通过独立多宿主测试，且加载顺序不参与仲裁。  
**Rollback plan:** 禁止新 service graph 激活，按 provider activation instance 逆序释放资源。

## TUI-PROP-008 Experimental Admission Profile

**Status:** Experimental  
**Reason for TUI-specific scope:** TUI 市场等级是产品 policy，不应修改 Community v0.1。  
**Community dependency:** schemas、registry、conformance claim。  
**Experimental capability name:** `x-ccch1mneyyy.tui.admission-profile`  
**Entry criteria:** `compatibilityDecision`、`verificationLevel`、`restrictions[]` 三维状态和 claim schema 可消费。  
**Exit criteria:** 每一档都有机器可读证据、失败原因、市场展示和迁移测试，人工判断不能替代证据。  
**Rollback plan:** 降低市场展示等级并撤销无证据 claim，不删除插件 artifact 或历史证据。

## TUI-PROP-009 Lightweight UI Contributions（Host-Rendered + Scene Components）

**Status:** Experimental
**Reason for TUI-specific scope:** TUI-PROP-006 的跨端 vnode 路线是重量级契约；实践中已验证存在两档更轻、且足以覆盖绝大多数插件 UI 需求的方式。本提案把两档都定义为契约，按插件与宿主渲染管线的耦合度排列：

- **Track A — host-rendered contributions**：宿主拥有布局**和**渲染，插件只提供消毒后的数据（托管对话框的标题/选项、键控状态行文本、纯文本条目渲染）。互操作关键不是组件模型，而是**消毒契约**。
- **Track B — scene components（in-process）**：宿主只拥有外框（全屏场景的进入/退出/生命周期），插件提供**组件**在宿主渲染器内自行渲染（TUI 的全屏场景接缝即此档）。互操作关键是**运行时注入契约**：组件必须使用宿主注入的 React 与 UI kit——插件自带第二份 React 时 hooks 必死（invalid-hook-call），且跨 React 大版本编译的元素 symbol 不被宿主 reconciler 接受；宿主注入的 props（React、ui kit、会话 channel、close）即组件的全部合法依赖。

Track B 仍假设插件与宿主同进程同渲染器（trusted-in-process 的直接推论），不解决跨端问题——跨端声明式 UI 仍是 PROP-006 的领地。三档耦合度递增：数据（A）< 进程内组件（B）< 跨端 vnode（PROP-006）。
**Community dependency:** v0.1 static contribution 和 effect ownership；与 PROP-006 互补（轻量两档先落地，vnode 档服务跨端场景）。
**Experimental capability name:** `x-ccch1mneyyy.tui.host-rendered-ui`（Track A）、`x-ccch1mneyyy.tui.scene-components`（Track B）
**Entry criteria:** Track A——消毒契约写成规范性文本：C0/C1 控制字符剥离、按终端 cell（而非字符数）限宽并带省略号、每类贡献的条目数/行数上限、非标量字段的丢弃或强转规则、非法输入警告拒绝而非抛异常；每类贡献（dialog/status/entry renderer）定义数据 schema 与宿主渲染所有权声明。Track B——注入 props 的稳定 contract（React/ui kit/channel/close）、场景注册-打开-关闭-释放生命周期、宿主 React 版本兼容规则（同大版本要求、hooks 与元素必须来自宿主 React）。
**Exit criteria:** Track A——同一贡献数据在两个 presentation adapter 上渲染结果一致且不破坏布局；消毒规则有共享 fixture（含敌意输入：控制字符、全宽字符、超长文本、非字符串字段）。Track B——同一插件场景在两个宿主 React 小版本间行为一致；违反注入契约（插件自带 React）有确定性报错而非渲染时崩溃。
**Rollback plan:** 停止加载对应 track 的 contributions，释放其 ledger 资源；flat commands 不受影响。

## 边界

上述提案不能把 `provides`、command tree、cross-platform UI、sandbox 或远程 Presentation 快照变成 Community v0.1 的隐式依赖。