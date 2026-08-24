# Governance Boundary

## 1. Sources

dsh-std 固定 submodule 是公共协议基线；dsh-TUI Admission 是产品准入 profile；本仓库 RFC 只定义 TUI 增量或保留历史引用路径。TUI policy 不修改 dsh-std 的协议含义，也不要求其他 Host 采用。

当前所有内容均为 Draft/Experimental，不代表 dsh 官方接受、认证或背书。

## 2. Status

正式状态为 `Draft`、`Experimental`、`Candidate`、`Stable` 和 `Deprecated`。进入 Candidate 前必须具有确定的协议坐标、definition、fixtures、失败语义和多实现证据。

## 3. Baseline updates

更新 `vendor/dsh-std` revision 必须记录受影响的 Manifest version、protocol definitions、admission decision 和迁移要求，并完整运行 conformance suite。不得在本仓库复制旧的 std schema 后继续以同一名称维护。

## 4. TUI-owned definitions

TUI 自有协议使用 `tui.dsh/*` namespace。新 definition 必须提供 `apiVersion + kind`、协议专属校验与协商器、contract profile、immutable digest 和 fixtures，并注册进 dsh-std `ProtocolCatalog`。目录或 package 的存在不等于 live support。

TUI-only 要求使用稳定的 `TUI-*` ID，并说明适用 profile、影响范围和兼容变化。

## 5. Evidence

参考实现和 TUI Host 只能提供 evidence，不能自我认证。claim 必须绑定 std revision、profile、Host、artifact 和 suite，并区分 declared、parsed、negotiated、tested、observed 与 attested。任何 evidence 都不是安全保证。

## 6. 供应链事件与版本撤回（RFC 0009）

- **状态词区分**：`yanked` / `deleted` 是版本生命周期元数据（registry 条目属性），不属于规范成熟度状态词（Draft / Experimental / Candidate / Stable / Deprecated）；两者语义域不同，文档不得混用。
- **撤回纪律**：retraction 记录（`registry/retractions-0.15.json`）只可追加、不可改写或删除；记录必须绑定受影响版本的 artifact digest。`yanked` 保留可下载且 digest 不变；`deleted` 从分发渠道移除，已有 digest 记录保留用于取证。
- **TUI-* 登记**：`TUI-SC-*` 要求按 §4 登记（适用 profile、影响范围、兼容变化），只约束 TUI 生态，不倒灌 Community Consensus。
- **对外部平台**：对 npm/GitHub 等外部平台的动作（删除、封锁）只作请求/配合，不写为 TUI 义务或平台义务。
- **响应流程**：事件响应操作流程（报告→验证→隔离→通知→恢复）归 SECURITY.md 与 `rfc/0009`；本文件只界定治理边界，不承载操作细节。
