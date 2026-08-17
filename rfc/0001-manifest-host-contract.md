# RFC 0001 — Manifest / Host / Broker Contract

**Status:** Experimental  
**Scope:** Community v0.1 core contract source

## 目的

定义插件与宿主之间的最小静态交互面：

`Manifest -> Registry -> Host Descriptor -> Negotiation -> Broker -> Lifecycle`

## v0.1 决定

- 唯一发现入口是包根目录 `dsh-plugin.json`；
- Manifest、Host Descriptor、event envelope、ledger 和 claim 使用 `schemas/` 中的 JSON Schema；
- capability/event/permission 必须来自真实 registry；
- contract compatibility 通过名称、版本和 schemaHash 判断；
- negotiation 是无副作用纯函数，结果必须包含稳定 decision/reasonCode；
- required 缺失或 hash 不匹配必须 fail closed；
- effect 必须归属到 plugin ID、activation instance 和 runtime generation；
- trusted-in-process 不是 sandbox，权限声明不构成技术安全边界。

## 交付物

- `schemas/dsh-plugin.schema.json`；
- `schemas/host-descriptor.schema.json`；
- `registry/registry-0.1.json`；
- `registry/permissions-0.1.json`；
- `registry/contracts/`；
- `conformance/fixtures/` 和 `conformance/tests/run.js`。

本 RFC 不把插件间 service、可修改事件或 UI adapter 纳入 v0.1；这些内容分别由 RFC 0002-0004 或 TUI proposal 处理。
