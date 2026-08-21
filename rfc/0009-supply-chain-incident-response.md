# RFC 0009 — 供应链事件响应与版本撤回（Supply-Chain Incident Response and Version Retraction）

**Status:** Experimental
**日期：** 2026-08-21
**输入案例：** crates.io `arrayref` 供应链攻击复盘（2026-08-20，见工作区 `blog.txt`）
**边界：** 本 RFC 只约束 dsh-TUI 生态（`TUI-*` 要求不外溢），不要求 dsh 官方或任何其他 Host 采用；不冻结任何官方实现表面（slot / data-* / seed modules / view position）。

## 1. 事件复盘（案例 → 缺口）

| blog.txt 事实 | 对 TUI 生态的启示 | 现行缺口 | 新增要求 |
| --- | --- | --- | --- |
| 已知插件 `arrayref` 被**重新发布**恶意版本（0.3.10 上线 86 分钟） | 准入时点通过不等于长期安全：已准入插件可被重发恶意版本 | `TUI-PKG-001` 只查准入时点 digest | `TUI-SC-001`：准入后历史版本完整性复查（同版本号 digest 变化即触发） |
| 恶意 crate（`proc-macro1` 等）经 **build script 下载 payload** | 插件依赖闭包可能引入未声明网络行为 | `TUI-DEP-001` 覆盖依赖闭包 digest，缺事后核查指令 | `TUI-SC-002` 配套：依赖闭包事后复验 + 受影响版本清单 |
| 恶意版本靠 **yank/删除** 下线，合法版本曾被攻击者恶意 yank | 版本生命周期需要明确的 yanked/deleted 语义与异常检测 | registry 无版本生命周期状态 | `registry/retractions-0.15.json` + `TUI-SC-003` 消费端处理 |
| 同作者其他 crate（`internment`、`append-only-vec`）一并受影响 | 一个账号失陷 → 该作者全部发行物可疑 | 无发布者身份失陷流程 | `TUI-SC-004`：作者级隔离（quarantine）与信任恢复 |
| 官方建议用户**自查本地依赖缓存** | 受影响范围需要用户侧可执行核查 | 无市场公告/核查指令机制 | 市场公告渠道 + 核查指令（本 RFC §4） |
| 恶意版本在线 86–107 分钟 | 检出/响应时间窗口是供应链核心指标 | 无响应时限目标 | 响应时限 SLO（本 RFC §4） |
| 第三方研究者发现 → 上报 → 官方验证 | 报告受理需要闭环 | SECURITY.md 只有"私下渠道报告"一句 | 报告受理/验证/分级流程（本 RFC §4 + SECURITY.md） |
| 官方声明"不认为作者恶意，账号可能失陷" | 失陷确认前需保护作者声誉 | 无对外沟通纪律 | 对外沟通纪律（本 RFC §4） |

## 2. 版本撤回语义（Retraction）

本 RFC 为 TUI 生态定义两种版本生命周期状态，作为 **registry 元数据**，与规范成熟度状态词（Draft / Experimental / Candidate / Stable / Deprecated）**明确区分、互不混用**：

| 状态 | 含义 | 获取性 |
| --- | --- | --- |
| `yanked` | 该版本被发现存在问题，**不再进入准入候选与推荐**；已安装用户保留使用 | **保留可下载**，artifact digest 不变（兼容 Reproducible Workspace / dependency lock 复现） |
| `deleted` | 该版本被认定为恶意或不可恢复，从分发渠道**移除** | 不可获取；已有 digest 记录应保留以支持取证 |

**不变性**：retraction 记录一旦发布，只可追加、不可改写或删除（`reason` 与日期字段不可变）。记录必须绑定受影响版本的 artifact digest。

**异常检测**：`TUI-SC-001` 复查发现以下情形视为异常，须触发事件响应：
- 同一版本号再次出现但 digest 改变（republish）；
- 合法版本被 yank 而无可信撤回理由（yank 被用作攻击手段）；
- 作者账号失陷迹象（同作者发行物出现异常重发）。

## 3. 推导的 TUI-* 要求（每条按 SPEC-WRITING-RULES §4 绑定 schema/fixture/测试/展示）

| ID | 要求 | schema | fixture | conformance 测试 | 失败时市场展示 |
| --- | --- | --- | --- | --- | --- |
| `TUI-SC-001` | 准入后历史版本完整性复查：同版本号 digest 变化即触发 | `registry/retractions-0.15.json` 形状 + digest 字段 | `valid-retraction.json` / `invalid-retraction-unknown-coordinate.json` | retraction 记录坐标必须存在于 profile；记录可追加不可改写 | 市场标记"历史版本完整性存疑"，暂停该版本推荐 |
| `TUI-SC-002` | 依赖闭包事后复验：受影响插件清单 + 用户侧核查指令 | 受影响清单格式（RFC §4） | —（流程性） | 发布公告时附带可执行核查指令 | 公告页 + 受影响版本清单 |
| `TUI-SC-003` | 消费端处理 yanked/deleted：yanked 不进入准入候选与推荐；已安装显示警告 | retraction 记录 | `valid-retraction.json` | 校验函数拒绝将 yanked 版本加入准入候选 | 已安装插件显示"该版本已撤回"警告 |
| `TUI-SC-004` | 发布者账号失陷：作者级隔离与信任恢复流程 | —（流程性） | —（流程性） | review | 隔离期间该作者全部发行物从推荐移除 |

## 4. 事件响应流程（TUI 侧动作；对外部平台只写"请求/配合"）

1. **报告受理**：任何渠道的供应链报告（第三方研究者 / 用户 / 维护者）进入安全渠道；记录报告人、时间、受影响坐标与版本、可复现材料；
2. **验证分级**：验证 digest 是否确实改变 / 依赖闭包是否引入未知发行物；按影响分级（阻断 / 高 / 中）；
3. **隔离与撤回**：对确认影响的版本发布 retraction（yanked 或 deleted）；作者级隔离按 `TUI-SC-004` 执行；
4. **通知与核查**：发布公告 + 受影响版本清单 + 用户侧可执行核查指令；对分发平台（npm 等）的删除/封锁动作只作"请求/配合"；
5. **恢复与复验**：事件处置后重新复验受影响插件的历史版本完整性；发布者信任恢复需满足再准入条件（身份重新验证、发行物 digest 全量复验）；
6. **沟通纪律**：失陷确认前对外表述必须保护被失陷作者声誉（"账号可能失陷，不推定主观恶意"）；不发布未经验证的指控。

**响应时限 SLO（目标，非 MUST）**：目标在检出后 24 小时内完成验证分级与 yanked 标记，72 小时内完成公告与核查指令发布。

## 5. 兼容性与迁移

- 本 RFC 全部内容为**新增层**：不改既有坐标、schema、状态词、registry 既有条目；`registry/retractions-0.15.json` 为独立新文件；
- 既有解析器按"未知字段忽略"兼容新文件；
- `TUI-SC-001/003` 只约束**新准入与推荐流程**；存量已安装插件通过事件响应流程覆盖（不追溯不意味着无保护——存量 digest 复验是响应流程的一部分）；
- conformance 只新增 fixtures 与断言，不删除既有断言。

## 6. 非目标

- 不要求 dsh 官方或任何其他 Host 实现本流程；
- 不冻结官方插件市场/分发机制的任何表面；
- 不把"安全插件""官方认证"等未授权措辞引入展示（沿用 `TUI-TRUST-001` 纪律）。
