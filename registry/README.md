# Capability / Event Registry

Registry 是 Community v0.15 contract 的一部分，不是 wiki 列表。真实条目位于 `registry-0.15.json`，权限位于 `permissions-0.1.json`，完整能力 profile 位于 `contracts/`。

## 条目要求

每个条目 MUST 包含：

```json
{
  "name": "messages.observe",
  "coordinates": {"apiVersion": "messages.dsh/v1alpha1", "kind": "MessageObserver"},
  "kind": "event",
  "version": "0.15",
  "schema": "registry/contracts/messages.observe-0.15.json",
  "schemaHash": "sha256:<64 lowercase hex chars>",
  "permissions": [],
  "requiredHostBehavior": []
}
```

`schemaHash` 是对应 contract profile UTF-8 字节的 SHA-256，不是随意填写的摘要。测试 runner 会验证 hash 漂移；修改 profile 必须新建版本或走治理迁移，不能原地重定义。

## 坐标与命名

v0.15 起契约以类 Kubernetes 坐标标识：`<group>/<version>` + `kind`（如 `commands.dsh/v1alpha1` + `Command`）。`v1alpha1` 标明实验期，可能 breaking。`name` 字段保留为 v0.1 平面名 legacy 别名（`storage.local` / `commands` / `messages.observe`），只用于迁移期解析，不作为新声明的主要形式。

标准坐标 group 为 `*.dsh`（Registry 为官方保留命名空间）；组织私有扩展使用 `x-org.example.*` 命名空间。禁止自造等价标准能力，禁止 `provides` 和 `requires.services`。

## 权限

权限必须在 `permissions-0.1.json` 注册，包含默认策略、scope 和可撤销性。Host Descriptor 表示宿主支持的权限；用户 grant 属于 authorize 阶段，不应被伪装成静态宿主能力。

## 变更

schema breaking change 必须产生新契约版本（新 `apiVersion`），并提供 affected contract、old/new behavior、migration path、compatibility window 和 removal date。deprecated 条目仍必须保留迁移窗口。Registry 的新增、变更和删除必须同步 fixtures、requirement matrix、CHANGELOG 和 conformance tests。
