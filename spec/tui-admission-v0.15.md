# dsh-TUI Ecosystem Plugin Admission v0.15

**Status:** Experimental / Product Policy  
**Authority:** dsh-TUI ecosystem maintainers
**Baseline:** [`dsh-std` pinned submodule](community-consensus-v0.15.md)

本文件只规定进入 dsh-TUI 插件目录、市场或推荐集合的额外条件。Manifest、协议协商、composition、lifecycle 以及 Community v0.15 的 Command、LocalStorage、MessageObserver 和 Presentation 语义来自 dsh-std。

## TUI-PKG-001 Package identity

插件必须在包根目录提供唯一 `dsh-plugin.json`，并通过固定 revision 的 `@dsh-std/manifest` Community v0.15 parser。用于 Verified claim 的 artifact 必须绑定 SHA-256 digest。

## TUI-PKG-002 Declaration closure

Manifest 中的 required/optional protocol、permission、subscription 和 contribution 必须全部静态声明。每项 protocol 必须能由本 profile 导入或拥有的 definition 解析；optional requirement 必须说明 TUI 可展示的 fallback。

私有 protocol 可以使用 `x-` namespace，但必须经过同一 Manifest projection、`ProtocolCatalog` negotiation、composition 和 lifecycle publication，不能由 TUI loader 旁路注入。

## TUI-HOST-001 Host descriptor

每个参与验证的 TUI Host 必须提供符合 `schemas/host-descriptor.schema.json` 的 descriptor。Descriptor 精确列出 facet API、protocol supports、definition source、权限、runtime generation、运行位置、headless 条件、trust level 和平台。

导入的 dsh-std definition 记录 package identity；本 profile 自有 definition 记录 immutable contract profile digest。Host 不得仅凭 package 已安装宣称 live support。

## TUI-RUN-001 Remote determinism

插件不得假定运行机器具有浏览器或 GUI，也不得把 remote/local 或 Presentation 保存为 activation 全局状态。需要用户交互的 command 或 operation 应从 invocation context 取得 `@dsh-std/presentation` 定义的类型化 client，或明确拒绝当前无法呈现的操作。

声明 remote attach 兼容的插件必须覆盖 local runtime、remote runtime、attach/detach 和多 Presentation 场景。remote attach 不是基础 Manifest 的隐式承诺。

## TUI-OBS-001 Ownership and cleanup

运行时 effect 必须归属到 component、facet activation instance 和 runtime generation。deactivate 后不得遗留可调用 handler、订阅、timer 或 connection attachment；cleanup failure 必须保留可诊断、可重试状态。

## TUI-DEP-001 Dependency closure

验证必须覆盖实际安装 artifact、依赖闭包、native/build step、override/patch 声明和固定的 dsh-std revision。只验证源码仓库或只执行参考实现测试，不足以产生 artifact claim。

## TUI-TRUST-001 Trust disclosure

当前 profile 为 `trusted-in-process`。Manifest permission 用于兼容性、授权提示和审计，不构成 OS、进程或 realm 安全边界。市场与安装界面必须明确展示这一点。

## Admission results

TUI admission evaluator 可以展示 `compatible`、`compatible_degraded`、`waiting_authorization`、`rejected` 和 `unknown`。这些状态是 product policy 对 dsh-std validation、composition、negotiation 和 authorization 报告的投影，不是另一套 core negotiation result。

私有协议的兼容性只能在 Host 和插件都声明相同 coordinate、definition 可解析且协议 evaluator 成功时成立。
