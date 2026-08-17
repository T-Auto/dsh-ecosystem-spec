# RFC 0006 — TUI Contributions

**Status:** Experimental
**Coordinates:** `x-ccch1mneyyy.tui/v1alpha1` `SettingsSection`, `Scene`

## Scope

本提案定义 dsh-TUI 接受的两类持久 contribution。Contribution 作为 facet extension 进入 manifest、composition 与 lifecycle；facet 停用时，其 contribution 必须同时移除。

`SettingsSection` 提供由宿主渲染的设置字段声明。`Scene` 提供 trusted-in-process 的全屏组件。Workspace provider、Command 及 invocation-scoped 用户交互分别使用 `workspace.dsh/v1alpha1`、`commands.dsh/v1alpha1` 与 `presentation.dsh/v1alpha1`，不在本提案中重复定义。

## SettingsSection

Manifest spec 声明 settings namespace、标题和宿主可渲染的字段。字段只包含可序列化数据；format、parse、存储与 credential 操作由宿主实现。Secret 字段只声明 credential reference，不得把 secret value 写入 manifest、contribution state 或普通 settings document。

同一 namespace 同时出现多个 active section 时，宿主必须拒绝后到的 contribution。移除 section 不删除对应 settings 或 credential。

## Scene

Scene spec 声明 identity 与显示标题。运行时 handler 提供组件；该组件只允许在 trusted-in-process shell 中执行。宿主注入 renderer、UI kit、当前 Channel 与 close 操作，组件不得把自带 renderer instance 当作宿主 instance 使用。

远端 endpoint 不得通过本协议发送可执行 Scene handler。跨 endpoint UI 必须使用可序列化、经独立协议协商的 contribution。

## Lifecycle and failure

Contribution handler 只能由声明它的 active facet 发布。注册、打开、调用或清理失败归属于该 facet；宿主必须保留其他 contribution 与基础 TUI。Facet deactivate、composition 替换或 loader rollback 时，宿主按注册逆序释放 contribution。

机器定义位于 [`protocols/tui-contributions.js`](../protocols/tui-contributions.js)。本协议不是安全边界；权限仍由其调用的 Workspace、Settings、Credential、Filesystem、Execution 与 Session 协议决定。
