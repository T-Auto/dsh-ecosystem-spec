# Governance Boundary

## 1. 权威来源

Community Consensus 定义跨宿主最低公共 contract；dsh-TUI Admission 定义 TUI 市场准入；RFC 是提案或延期主题；Adapter note 只记录适配细节。TUI 规则不得倒灌 Community Consensus。

当前仓库所有规范均为社区侧 Draft/Experimental，不代表 dsh 官方接受、认证或背书。

## 2. 正式状态

正式状态只有：`Draft`、`Experimental`、`Candidate`、`Stable`、`Deprecated`。`Community Draft`、`Deferred from v0.1` 可作为说明，不是独立规范状态。

- Draft：未冻结，不能作为长期依赖；
- Experimental：可实现，可能 breaking；
- Candidate：schema、registry、fixtures、tests 齐全，并等待独立实现证据；
- Stable：治理批准且有多实现 conformance evidence；
- Deprecated：有迁移窗口，不鼓励新实现。

## 3. Community 变更

修改 Community contract MUST：引用 RFC、写清问题/证据/兼容影响、更新 schema/registry、增加 fixtures 和 conformance test、提供迁移窗口、更新 CHANGELOG。Breaking change MUST 新建版本，禁止用 minor bump 掩盖。

## 4. TUI 变更

TUI-only 规则 MUST 使用稳定 `TUI-*` requirement ID，并在变更材料中标注适用 profile、影响插件范围、兼容变化和迁移内容。TUI policy 不能要求其他宿主兼容。

## 5. 证据边界

参考实现和 TUI Host 只能提供 evidence，不能自我认证。claim 必须绑定不可变 spec/Host/artifact/suite digest，并区分 Declared、Parsed、Negotiated、Tested、Observed、Attested。任何证据都不得表述为安全保证。
