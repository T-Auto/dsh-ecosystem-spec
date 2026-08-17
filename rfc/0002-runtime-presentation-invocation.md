# RFC 0002 — Runtime / Presentation / Invocation / Transport

**Status:** Experimental  
**Scope:** Deferred from Community v0.1; TUI remote profile research

## 背景

Remote SSH 证明“Host = 运行地点 + UI 客户端”是错误抽象。Community v0.1 只保留最小 `runtimeGenerationId` scope，不冻结完整远程控制 contract。

## 五个概念

- **Runtime**：插件实际运行位置；
- **Transport**：runtime 与 client 之间的连接方式；
- **Presentation**：用户看到和操作的界面能力；
- **Invocation**：一次具体调用携带的能力、授权、deadline 和 cancellation 快照；
- **Control**：attach、授权、session 和生命周期控制面。

## 待冻结不变量

同一个 Runtime 可以被多个 Presentation attach；一个 Presentation 可以切换多个 Runtime；插件不能通过 activation 时的全局状态猜测当前调用者的 Presentation 能力。

## TUI 实验扩展

实验性 capability name：`x-ccch1mneyyy.tui.presentation-snapshot`。它可携带：

```text
presentation capabilities
runtime capabilities
authorization context
deadline
cancellation
```

进入 Community contract 前必须补 invocation schema、attach/detach fixture、多客户端测试、权限撤销和 rollback 规则。