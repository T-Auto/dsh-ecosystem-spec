# Capability / Event Registry

Registry 是 Community v0.1 contract 的一部分，不是 wiki 列表。真实条目位于 `registry-0.1.json`，权限位于 `permissions-0.1.json`，完整能力 profile 位于 `contracts/`。

## 条目要求

每个条目 MUST 包含：

```json
{
  "name": "messages.observe",
  "kind": "event",
  "version": "0.1",
  "schema": "registry/contracts/messages.observe-0.1.json",
  "schemaHash": "sha256:<64 lowercase hex chars>",
  "permissions": [],
  "requiredHostBehavior": []
}
```

`schemaHash` 是对应 contract profile UTF-8 字节的 SHA-256，不是随意填写的摘要。测试 runner 会验证 hash 漂移；修改 profile 必须新建版本或走治理迁移，不能原地重定义。

## 命名

标准 namespace：`<domain>.<resource>[.<action>]`。组织私有扩展：`x-org.example.<domain>.<name>`。v0.1 禁止自造等价标准能力，禁止 `provides` 和 `requires.services`。

## 权限

权限必须在 `permissions-0.1.json` 注册，包含默认策略、scope 和可撤销性。Host Descriptor 表示宿主支持的权限；用户 grant 属于 authorize 阶段，不应被伪装成静态宿主能力。

## 变更

schema breaking change 必须产生新 contract version，并提供 affected contract、old/new behavior、migration path、compatibility window 和 removal date。deprecated 条目仍必须保留迁移窗口。Registry 的新增、变更和删除必须同步 fixtures、requirement matrix、CHANGELOG 和 conformance tests。
