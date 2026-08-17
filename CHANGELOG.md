# Changelog

## 2026-08-17（v0.15 对齐，社区 RFC v0.15）

### Breaking（Draft 阶段，迁移自 Community Consensus v0.1）

- **Manifest 结构升级到 v0.15**：顶层 `entry` / `apiVersion` 移除，改为 `facets.host.{entry, apiVersion}`（当前唯一注册值 `v1alpha1`）；`client` / `worker` 为保留名，出现即 `INVALID_MANIFEST`（契约归 RFC 0002）。
- **契约坐标化（元协议内核）**：`requires.capabilities.required/optional[]` 改为 `requires.contracts[]`，引用类 K8s 坐标 `apiVersion + kind`；registry 与契约 profile 增加坐标（`storage.dsh/v1alpha1`+LocalStorage、`commands.dsh/v1alpha1`+Command、`messages.dsh/v1alpha1`+MessageObserver），v0.1 平面名保留为 legacy 别名。
- **协商器改为坐标匹配**：group+kind 未知 → `INVALID_MANIFEST`（rejected）；group+kind 已知但 apiVersion 未注册 → `unknown`；决策优先级不变。
- **Host Descriptor 坐标化**：`apiVersions` 改为 `facetApiVersions`（`v1alpha1` 风格）；`contracts[]` 以坐标 + schemaHash 声明，且必须与 registry 一致（fail closed）。
- **messages.observe payload 对齐 MCP ContentBlock**：`textPreview` 移除，改为 `payload.content[]`（text / image 子集，边界待社区 §9 Q3 定案）；envelope 头字段不变。
- **版本号全线升到 0.15**：manifestVersion、eventVersion、ledgerVersion、claimVersion、specVersion `community-v0.15`、registryVersion；契约 profile 版本升到 0.15 并重新固定 schemaHash。
- 文件改名：`spec/community-consensus-v0.1.md → v0.15`、`spec/tui-admission-v0.1.md → v0.15`、`conformance/requirements-v0.1.json → v0.15`、`registry/registry-0.1.json → 0.15`、`registry/contracts/*-0.1.json → -0.15.json`。

### Added

- fixtures：`valid-plugin-object-subs`（坐标化 subscription 对象形式）、`invalid-plugin-unknown-coordinate`（未知 group）、`invalid-plugin-client-facet`（保留名拒绝）、`invalid-message-content`（ContentBlock 缺字段）；
- runner：坐标索引（byCoordinate / byName）、`resolveContractRef` / `resolveSubscription`、`validateHost`（坐标 + hash 钉死 registry）、oneOf 校验支持、`rejected` 协商断言；
- 规范文本：C-004 元协议坐标；版本模型 §10（六维独立演进）。

### 待社区定案（不影响本版实验实现）

- fallback 的承载机制（上游 v0.15 未定，本地按 TUI 收紧执行）；
- subscriptions 引用格式（上游示例为扁平字符串，本文同时接受坐标对象与 legacy 字符串）；
- ContentBlock 字段边界（§9 Q3）、privacyClass 分级（§9 Q4）；
- RFC 0004 证据等级术语（declared/resolved/decided vs 本库 Declared/Parsed/Negotiated...）待上游定案后对齐。

## 2026-08-17（实验增补，issue #266）

### Added

- RFC 0005（Decision Events）：认领 `before-*` 延期主题——envelope（`expectsDecision`）、决定词汇表、链语义 D-1~D-5、D-6 陈旧决策按身份/代际丢弃（禁 id 比较）、D-7 拦截订阅显式授权默认拒绝、D-8 parked 同步性；TUI 实验能力名 `x-ccch1mneyyy.tui.decision-events`。
- TUI-PROP-009（Lightweight UI Contributions）：两档轻量 UI 契约——Track A 宿主拥有渲染、插件供消毒数据；Track B 插件组件在宿主渲染器内渲染。
- `adapters/` 目录与 Adapter Note 模板；SPEC-WRITING-RULES §2 同步分区。

### Changed

- §10 延期条目为 `before-*` 事件补充方向性约束（拦截类订阅必须显式授权、默认拒绝）并指向 RFC 0005；
- C-010 补充 trusted-in-process 宿主的 runtime generation 粒度；
- README：声明 `$id` 占位域不可解析、example Host Descriptor 为示意值。

## 2026-08-17（评审修订，issue #266）

### Changed

- **Breaking（Draft 阶段）**：optional capability 引用的 `fallback` 改为必填（C-030）。
- C-030 补全语义：`unknown` 触发条件限定为两种；明确决策优先级。
- TUI Admission §2：`Listed` 统一为 `Declared`；"TUI Verified" 获得显式定义。
- `requirements-v0.1.json` 每条增加 `evidence: automated | review` 标记。

### Added

- fixtures：`invalid-plugin-optional-no-fallback`、`invalid-plugin-provides`、`unknown-version-plugin`、`host-no-observe.example`；
- runner：`unknown` 决策分支、contract profile 十点完整性检查、`compatible_degraded` 与 `unknown` 协商断言。

## 2026-08-17

### Added

- 建立 `dsh-ecosystem-spec` 文档簇；
- 分离 Community Consensus 与 dsh-TUI Admission；
- 增加 TUI 实验性提案区、Governance / Conformance / Registry 文档；
- 增加 RFC 0000-0004 索引性规范文档；
- 增加 Manifest、Host Descriptor、event envelope、effect ledger、claim schema；
- 增加真实 registry、permission registry、contract profile、fixtures 和零依赖 conformance runner；
- 增加 `C-*` 与 `TUI-*` requirement ID、状态模型和 claim 绑定要求。

### Positioning

- 明确本仓库是社区侧、实验性规范库；不要求 dsh 官方立即采纳；
- 明确 TUI 准入规则不自动等于社区标准或官方标准；
- 明确 reference implementation != specification；
- 明确 trusted-in-process capability/permission 不是技术安全边界。
