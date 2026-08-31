# deepseek-harness 0.1.2-alpha.1 与 dsh-std 思路对比分析

- 上游版本：`0.1.2-alpha.1`
- 对比基线：`0.1.1-rc.2`
- 分析日期：2026-08-31
- 状态：Draft
- 定位：社区观察 / 影响评估，不声称官方认可

## 结论

`dsh-v0.1.2-alpha.1` 相对上个发布版 `dsh-v0.1.1-rc.2` 的改动，明显在往“协议/契约优先、领域与传输分离、避免私有扩展、用标准协议互操作”这个方向走。这和 `dsh-std` 的核心思路非常接近。

对比范围：

```text
dsh-v0.1.1-rc.2  →  dsh-v0.1.2-alpha.1
```

这两个 tag 之间的 diff 很大（约 6421 个文件），但架构性的证据主要集中在下面几块。

---

## 1. 把“业务 API / 传输 / 客户端展现”拆成独立所有权层

0.1.2 新增了一组 `api/*` 控制器：

- `packages/api/session-controller/`
- `packages/api/settings-controller/`
- `packages/api/workspace-controller/`
- 同时扩展了 `packages/api/gateway/` 的流式 Remote 协议

配套的 Agent Note 写得很直白：

> `.agents/notes/implemented/architecture/2026-08-18-session-history-and-event-transport.md`

核心表述是：

- Session Controller / Workspace Controller 自己拥有 Host API、wire types 和 Client adapters；
- Gateway 只负责 Remote transport、流生命周期和事件协调；
- Gateway “不需要理解 Session、Workspace、Approval、Question 的业务数据”；
- Client Runtime 只负责组装和消费，不再实现另一个 carrier 状态机。

这非常像 `@dsh-std/core` 的设计原则：

> Core 只做协议声明、发现、协商和聚合，不解释具体领域语义；
> 领域协议拥有自己的语义，产品实现/适配器拥有集成。

另一个 Agent Note：

> `.agents/notes/implemented/architecture/2026-08-20-client-session-conversation-ownership.md`

明确废除了中央 `client/runtime` 聚合层，改成：

```text
Remote / Controller / domain object
        ↓ 纯 Observable source
    ui-* adapter
        ↓ 标准 source registration
    ui-renderer
        ↓ selector hook
    Slot component
```

也就是说：

- Controller 是 React-free 的领域逻辑所有者；
- UI adapter 只负责 React 集成；
- renderer 只做通用绑定；
- 领域契约和呈现契约分开。

这和 dsh-std 里“产品集成放 adapter，可移植协议包不要吸收产品实现”是同一种结构。

---

## 2. 出现“独立版本 + 注册表式扩展”的协议化设计

0.1.2 新增：

- `packages/llm/deepseek-llm-api-extensions/`
- `docs/deepseek-llm-api-wire-extensions.md`

里面明确写：

> Each body extension owns its `version` independently.
> A version applies only to the object that contains it; no compatibility or ordering relationship exists between versions of different fields.

并且：

- `DeepSeekLlmApiExtensionRegistry` 保证一个 top-level 字段只能有一个 provider；
- 字段名必须合法、非空、去空格；
- receiver 按“字段名 + 自己的 version”分发；
- 不依赖 JSON 字段顺序。

这几乎就是 dsh-std 的 `ProtocolCatalog` 思路的产品内版本：

> dsh-std：每个协议拥有自己的 `apiVersion` 和 `kind`，core 按 `apiVersion + kind` 解析定义，不推断协议间兼容性，不允许重复注册同一定义。

证据文件：

- `packages/llm/deepseek-llm-api-extensions/src/index.ts`
- `packages/llm/deepseek-llm-api-extensions/README.md`
- `docs/deepseek-llm-api-wire-extensions.md`

---

## 3. 明确用标准协议，拒绝私有扩展

0.1.2 的 ACP 自动化控制是一个很强的标志：

> `.agents/notes/implemented/feature/2026-08-22-standard-acp-automation-controls.md`

里面明确说：

- DSH 实现完整的 standard ACP v1 子集；
- 不添加自定义 method、自定义 capability flag、`_meta`；
- 不给私有元数据赋予私有含义；
- 泛化外部自动化控制器不应该依赖 DSH 私有 side protocol。

这是 dsh-std 的核心价值观：

> 互操作遵循已声明的协议，而不是产品名、私有 npm 包或私有 side channel。

---

## 4. SDK 协议被刻意做成一门“可独立实现的线协议”

0.1.2 虽然不是新增 `packages/sdk`，但继续强化了它：

- `packages/sdk/protocol/` 是纯 wire library；
- 它描述 JSON-RPC 2.0 的 framing、方法名、payload types、error semantics；
- 自己说明：pure library，没有 plugin、没有 config、没有 registrations；
- Python SDK 镜像这些 shape，而不 import TypeScript 包。

这和 dsh-std README 的表述高度一致：

> A conforming implementation does not have to use the TypeScript packages or DeepSeek Harness.

相关文件：

- `packages/sdk/protocol/README.md`
- `packages/sdk/protocol/src/types.ts`
- `packages/sdk/client/src/client.ts`
- `packages/sdk/server/src/server.ts`

0.1.2 还新增了：

- `packages/bundle/sdk-app/`
- `packages/bundle/sdk-minimal/`
- `packages/bundle/acp-app/`

也就是把不同产品形态变成可组合 profile：

```text
web / headless / sdk / sdk-minimal / acp
```

这和 dsh-std 所说的：

> Host、TUI、Web、GUI、plugin 可以只实现自己需要的协议子集

是同一个形态。

---

## 5. 大量“contract”目录被从中央层移到领域所有者

0.1.2 把很多 client contract 从旧的中央 `client/runtime/src/client/contract/` 移到各自的领域包：

- `packages/api/session-controller/src/client/contract/*`
- `packages/client/ui-chat/src/client/contract/*`
- `packages/client/ui-conversation/src/client/contract/*`
- `packages/client/ui-approval/src/client/contract/*`

例如：

> `packages/api/session-controller/src/client/contract/session.ts`

开头就写：

> Feature packages never see the concrete Session class.
> Widening this interface is the explicit act of widening what features may do to a session.

这也是一种“契约归所属领域拥有”的做法，和 dsh-std 的“每个协议包自己维护类型、validator、schema、conformance”很接近。

---

## 6. Typert Remote 被强化成“协议声明层”

0.1.2 大幅扩展了 `packages/typert/protocol/`：

- 它定义 `@Remote` / `@RemoteScope`、wire descriptors、codecs、lookup maps、context maps；
- 它是“compiler-independent Remote protocol declarations”；
- “registers no Cordis service and runs no TypeScript analysis; it declares types and decorator markers only”；
- 有 wire identity grammar，所有 namespace/method/lookup/context 段都必须合法；
- 生成物、Host Gateway、Client API 共用同一套 `InvocationDescriptor`。

虽然这是 DSH 产品内部的 RPC 协议，不是 `@dsh-std` 公共协议，但它的角色已经很像 std 里的“协议包 + 类型 + 校验 + 参考生成器”。

相关文件：

- `packages/typert/protocol/src/index.ts`
- `packages/typert/protocol/src/types.ts`
- `packages/api/gateway/src/stream-protocol.ts`
- `packages/api/gateway/src/client/stream-client.ts`

---

## 边界说明

deepseek-harness 本体目前**没有直接依赖 `@dsh-std`**，也没有在 harness 内部实现一个完整的通用 `ProtocolCatalog` / 声明协商层。

所以更准确的说法是：

- 它现在做的还是“产品内部的契约化、协议化、所有权分层”；
- 但方向和 dsh-std 非常一致，尤其是：
  - 不让中心层理解所有业务；
  - 让领域包拥有自己的 API / wire types / client contracts；
  - 用标准外部协议而不是私有扩展（ACP）；
  - 给可扩展字段加独立版本和注册表；
  - 把不同产品形态拆成可组合 profile/bundle。

如果下一步希望把 harness 本体真正接到 `@dsh-std`，这些改动已经为 adapter 做好了相当一部分接口基础。
