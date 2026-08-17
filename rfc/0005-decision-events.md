# RFC 0005 — Decision Events（决策事件 / before-* 拦截）

**Status:** Experimental
**Scope:** Deferred from Community v0.1（认领 §10 的 "`before-*` 修改/取消事件"）；TUI 决策接缝契约研究

## 背景与动机

Community v0.1 唯一的事件 contract 是 `messages.observe`——只读、不得修改或阻断。但宿主的实际插件需求里存在大量**决策点**：用户输入投递前改写或否决、会话切换前否决、压缩前否决、回退前提供额外模式。这类事件要求监听器返回一个**决定**（decision），宿主按决定改变后续流程。

这类"veto 链"的语义是跨宿主不一致风险最高的地方：链按什么顺序执行、一个监听器崩溃或返回畸形值是否截断后续监听器、"第一个返回生效"还是"第一个**合法**决定生效、决策等待期间世界已变化（会话被切换）时陈旧决定如何处理。每个宿主各自发明一套，插件就只能锁定单个宿主。本 RFC 把这套语义定义为可移植 contract。

本 RFC 不改变 `messages.observe` 的只读语义；决策事件是独立事件类别。

## 术语

- **Decision event**：`expectsDecision` 为 true 的事件；宿主在决策点暂停流程，等待监听器链的决定。
- **Interceptor**：订阅 decision event 的插件监听器。
- **Decision**：监听器返回的、经宿主归一化（normalize）后合法的决定对象。
- **No-opinion**：监听器明确表示"无意见"的返回（`undefined` / `null` / `false`），不构成决定。

## Envelope

决策事件 envelope 沿用 `messages.observe` 的头字段，增加决策标记：

```text
eventType / eventVersion / eventId / scope / sequence   （同 messages.observe）
expectsDecision: true
privacyClass: public | internal | sensitive             （三档沿用）
payload: contract 自定（决策点上下文，如被拦截的文本、目标会话引用）
```

每个具体决策事件（input、session-switch 等）由自己的 contract profile 定义 payload schema、合法决定形状和默认流程（无监听器或全部 no-opinion 时的行为——MUST 是不拦截时的原有行为）。

## 决定词汇表

监听器返回值只有四类语义：

1. **No-opinion**：`undefined` / `null` / `false`——本监听器无意见，链继续；
2. **否决**：`{ "cancel": true, "reason": <可选字符串> }`——中止被拦截的操作；reason 由宿主展示给用户；
3. **Contract 自定义决定**：由具体 contract 定义形状的对象（如 input 事件的 `{ "text": <改写后文本> }`、rewind 事件的 `{ "modes": [...] }`）；
4. **其他一切**：非法形状——不是 no-opinion 也不是决定（见 D-3）。

## 链语义

宿主 MUST 按以下语义执行 interceptor 链：

- **D-1 注册顺序 serial**：按注册顺序逐个 await，不并行。并行会让"第一个合法决定"失去定义。
- **D-2 逐监听器异常隔离**：监听器 throw 或 reject 时，宿主 MUST 记录（非敏感）并继续下一个监听器——一个崩溃的 interceptor MUST NOT 截断链上后续（可能是安全）否决。
- **D-3 归一化在隔离边界内**：每个返回值经 contract 的 normalize 校验后才算决定；normalize 本身抛错（敌意返回值，如 Proxy 或带抛错 getter 的对象）视同该监听器失败，记录并继续。非法形状（空白改写、junk 原语、缺必填字段的决定对象）记录并继续。
- **D-4 第一个合法决定生效**：链在第一个 normalize 后非 no-opinion 的合法决定处停止，该决定即为事件结果；后续监听器不再执行。no-opinion 和非法形状 MUST NOT 截断链。
- **D-5 全链无决定 = 默认流程**：所有监听器 no-opinion（或全部失败）时，宿主 MUST 按该决策点的默认（未被拦截）流程继续。

## D-6 陈旧决策

决策是 async 的：等待期间被拦截的操作所作用的对象可能已被替换（典型：等待期间用户切换了会话——会话 id 可复用，A → 新建 → 恢复 A 之后 id 相同但运行时身份已变）。

宿主 MUST 在决策得出后、应用前校验目标对象的**运行时身份或代际**（identity / generation），与发起决策时一致才应用；不一致 MUST 丢弃该决定并按默认流程（或显式取消）继续，并给出可观测提示。禁止按可复用的名称/id 做此校验（ABA 问题）。

## D-7 授权

拦截是严格强于观察的能力：能否决用户输入或会话切换的插件可以改变用户意图的执行结果。因此：

- 订阅 decision event MUST 需要显式 grant，**默认拒绝**、可撤销（与 `messages.observe.read` 同档）；
- 权限命名方向：`domain.resource.intercept`（如 `session.input.intercept`），按具体 contract 注册进 permissions registry；
- 宿主 MUST 在订阅、grant 撤销和 scope 变更时重新检查授权；grant 不存在的 interceptor 视同未注册（不进入链）。

## D-8 同步性

- 决策等待期间，被拦截的宿主流程处于 **parked** 状态（输入未投递、切换未发生）；宿主 MUST 为该状态提供用户可观测的指示。
- 需要用户输入才能决定的 interceptor SHOULD 使用宿主的托管交互能力（如 TUI 的托管对话框），MUST NOT 假设可以裸阻塞任意时长；宿主 MAY 设定决策预算，超时按该 interceptor 失败处理（D-2）。
- 决策事件本身是宿主流程的关键路径：宿主 MUST NOT 因 interceptor 数量或总耗时失去响应。

## 与 messages.observe 的关系

同一事实可以同时产生两类事件：observe 事件只读通报（任何授权观察者），decision 事件在变更点要求决定（仅授权 interceptor）。observe 的只读语义不受本 RFC 影响；decision 事件的 payload 构造 MUST 遵守与 observe 相同的 privacyClass 与脱敏规则。

## 晋级前必须定义

- 每个具体决策事件的 contract profile（payload schema、决定形状、默认流程、privacyClass）；
- 稳定错误码（如 `DECISION_STALE`、`INTERCEPT_PERMISSION_NOT_GRANTED`、`DECISION_BUDGET_EXCEEDED`）；
- 授权撤销、运行时 generation 变更与在途决策的交互 fixture；
- 多宿主 conformance：链顺序、隔离、首合法生效、陈旧丢弃、default-deny 的共享 fixture；
- 决策预算/超时的统一语义。

## TUI 实验扩展

实验性 capability name：`x-ccch1mneyyy.tui.decision-events`。

TUI profile 已按本 RFC 语义实现的决策点：用户输入（改写/接管/否决）、回退前（否决/提供额外模式）与回退完成、会话切换前否决与切换后通知、压缩前否决。这些在 TUI Admission 中标为 `experimental-contract`，不作为 Community v0.1 兼容的必要条件。
