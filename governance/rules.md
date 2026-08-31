# Governance Boundary

> 治理总纲见 [../GOVERNANCE.md](../GOVERNANCE.md)；提案流程与索引见
> [../rfc/README.md](../rfc/README.md)；讨论处置见
> [../decisions/README.md](../decisions/README.md)。

## 1. Sources

`dsh-ecosystem-spec` 是 DSH 社区生态互操作、conformance、registry 与治理的规范入口。
dsh-std 固定 submodule 是公共协议基线；dsh-TUI Admission 是第一个产品准入 Profile；
本仓库 RFC 既承载生态级提案，也保留 TUI 增量与历史引用路径。TUI policy 不修改
dsh-std 的协议含义，也不要求其他 Host 采用。

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
