# RFC 0001 — Manifest / Host / Broker Contract

**Status:** Experimental  
**Scope:** Community v0.15 core contract source

## 目的

定义插件与宿主之间的最小静态交互面：

`Manifest -> Registry -> Host Descriptor -> Negotiation -> Broker -> Lifecycle`

## v0.15 决定（对齐社区 RFC v0.15）

- 唯一发现入口是包根目录 `dsh-plugin.json`；
- Manifest 采用 Facet 对象模型：`facets.host.{entry, apiVersion}`；client / worker 是保留名（RFC 0002），v0.15 拒绝出现；
- 契约引用采用元协议坐标 `apiVersion + kind`（如 `commands.dsh/v1alpha1` + `Command`），按 `requires.contracts` 声明；v0.1 平面名保留为 registry legacy 别名；
- Manifest、Host Descriptor、event envelope、ledger 和 claim 使用 `schemas/` 中的 JSON Schema；
- capability/event/permission 必须来自真实 registry（`registry-0.15.json`）；
- contract compatibility 通过坐标 + schemaHash 判断；Host Descriptor 声明的坐标与 hash 必须与 registry 一致（fail closed）；
- negotiation 是无副作用纯函数，结果必须包含稳定 decision/reasonCode；决策优先级 `unknown > rejected > waiting_authorization > compatible_degraded > compatible`；
- required 缺失或 hash 不匹配必须 fail closed；optional 缺失必须有 fallback 才能降级；
- messages.observe payload 与 MCP ContentBlock 对齐（text/image 子集，边界待社区 §9 Q3 定案）；
- effect 必须归属到 plugin ID、activation instance 和 runtime generation；
- trusted-in-process 不是 sandbox，权限声明不构成技术安全边界。

## 交付物

- `schemas/dsh-plugin.schema.json`；
- `schemas/host-descriptor.schema.json`；
- `registry/registry-0.15.json`；
- `registry/permissions-0.1.json`；
- `registry/contracts/`；
- `conformance/fixtures/` 和 `conformance/tests/run.js`。

本 RFC 不把插件间 service、可修改事件或 UI adapter 纳入 v0.15；这些内容分别由 RFC 0002-0005 或 TUI proposal 处理。
