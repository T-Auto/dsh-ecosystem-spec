# Changelog

## 2026-08-17（实验增补，issue #266）

### Added

- RFC 0005（Decision Events）：认领 §10 的 `before-*` 延期主题——envelope（`expectsDecision`）、决定词汇表、链语义 D-1~D-5（注册序 serial、逐监听器隔离、归一化同边界、首合法决定生效、无决定走默认流程）、D-6 陈旧决策按身份/代际丢弃（禁 id 比较）、D-7 拦截订阅显式授权默认拒绝、D-8 parked 同步性；TUI 实验能力名 `x-ccch1mneyyy.tui.decision-events`。
- TUI-PROP-009（Lightweight UI Contributions）：两档轻量 UI 契约——Track A 宿主拥有渲染、插件供消毒数据（消毒契约：控制字符剥离、按 cell 限宽、条目上限、非标量丢弃）；Track B 插件组件在宿主渲染器内渲染（运行时注入契约：宿主 React/ui kit/channel、版本兼容规则）。
- `adapters/` 目录与 Adapter Note 模板；SPEC-WRITING-RULES §2 同步分区。

### Changed

- §10 延期条目为 `before-*` 事件补充方向性约束（拦截类订阅必须显式授权、默认拒绝）并指向 RFC 0005；
- C-010 补充 trusted-in-process 宿主的 runtime generation 粒度（一次完整插件运行时生命周期）；
- README：声明 `$id` 占位域不可解析、example Host Descriptor 为示意值；RFC 范围更新为 0002-0005。

## 2026-08-17（评审修订，issue #266）

### Changed

- **Breaking（Draft 阶段）**：optional capability 引用的 `fallback` 改为必填（C-030）——没有书面降级行为的"可选"声明是 `INVALID_MANIFEST`。迁移：manifest 中每个 `requires.capabilities.optional[]` 条目补 `fallback` 字段。
- C-030 补全语义：`unknown` 触发条件限定为"contract version 未注册 / registry 版本高于协商器支持"两种；明确决策优先级 `unknown > rejected > waiting_authorization > compatible_degraded > compatible`。
- TUI Admission §2：`Listed` 统一为 `Declared`（对齐 claim schema 的 evidence ladder）；"TUI Verified" 获得显式定义（`verificationLevel ≥ Tested` 且 claim 未过期未撤销的市场展示标签）。
- `requirements-v0.1.json` 每条增加 `evidence: automated | review` 标记；C-050/C-070 如实标为 review。

### Added

- fixtures：`invalid-plugin-optional-no-fallback`、`invalid-plugin-provides`、`unknown-version-plugin`、`host-no-observe.example`；
- runner：`unknown` 决策分支、contract profile 十点完整性检查（C-040 转为 automated）、`compatible_degraded` 与 `unknown` 协商断言；
- `permissions-0.1.json`：`commands.invoke` 补充 default allow 的 rationale。

### Fixed

- C-002 的 `provides` 半边补负例 fixture；
- README 错别字。

## 2026-08-17

### Added

- 建立 `dsh-ecosystem-spec` 文档簇；
- 分离 Community Consensus 与 dsh-TUI Admission；
- 增加 TUI 实验性提案区；
- 增加 Governance / Conformance / Registry 文档；
- 增加 RFC 0000-0004 索引性规范文档；
- 增加 Manifest、Host Descriptor、event envelope、effect ledger、claim schema；
- 增加真实 registry、permission registry、contract profile、fixtures 和零依赖 conformance runner；
- 增加 `C-*` 与 `TUI-*` requirement ID、状态模型和 claim 绑定要求。

### Positioning

- 明确本仓库是社区侧、实验性规范库；
- 明确不要求 dsh 官方立即采纳；
- 明确 TUI 准入规则不自动等于社区标准或官方标准；
- 明确 reference implementation != specification；
- 明确 trusted-in-process capability/permission 不是技术安全边界。
