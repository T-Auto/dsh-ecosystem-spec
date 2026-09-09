# 目录规范与新增挂载流程

> 本文回答一个问题：**以后每加一个子协议、范例实现或市场，应该放在哪里、要改哪些文件？**
> 目录规范由 [`../scripts/verify-structure.mjs`](../scripts/verify-structure.mjs) 在 CI 中强制，
> 不是口头约定。

## 1. 三条设计原则

1. **入口不复制正文。** 协议与实现的正文永远在它们自己的仓库里；本仓库只做
   索引、说明、校验与治理。挂载用 git submodule 固定 revision，不 vendored 副本，
   因此不存在“本仓库的 std 副本落后上游”这类漂移。
2. **类别决定路径。** 一个东西属于元协议、子协议还是范例实现，由它在生态里的
   **职责**决定；类别一旦确定，挂载路径前缀就唯一确定（见 §3）。类别信息同时写进
   `registry/`，CI 双向校验。
3. **一次 PR 只做一类事。** 新增挂载、修订索引、改写说明文档、升级 revision 各自
   独立提交，避免“顺手规范化”。

## 2. 顶层目录一览

| 路径 | 职责 | 谁维护 | 不该放什么 |
| --- | --- | --- | --- |
| `README.md` | 人读入口：定位、生态地图、挂载表、导航 | 本仓库 | 协议正文 |
| `CONTRIBUTING.md` | 贡献规则：分区纪律、PR 要件、新增流程入口 | 本仓库 | 技术方案 |
| `SECURITY.md` | 安全边界声明与报告渠道 | 本仓库 | 能力清单 |
| `docs/` | 说明性文档：总览、目录规范、范例说明 | 本仓库 | 规范正文、机器可读数据 |
| `governance/` | 治理：权威归属、状态词、基线升级、命名空间、证据 | 本仓库 | 具体协议语义 |
| `decisions/` | 决策记录（ADR）与索引 | 本仓库 | 提案正文 |
| `registry/` | 机器可读索引：协议 / 范例 / Profile | 本仓库 + CI 校验 | 协议自身的 registry |
| `profiles/` | 产品准入 Profile（只约束自己声明的生态范围） | 各 Profile 归属方 | 公共协议语义 |
| `vendor/` | **挂载区**：外部仓库 submodule | 上游各自维护 | 本仓库自己写的代码 |
| `scripts/` | 本仓库自己的校验脚本（零依赖） | 本仓库 | 上游构建脚本 |
| `.github/workflows/` | 本仓库自己的 CI | 本仓库 | 上游 CI |

> 本仓库**不设归档目录**：过时内容直接删除，需要时从 git 历史取回
> （见 [`../decisions/0001-remove-legacy-archive.md`](../decisions/0001-remove-legacy-archive.md)）。
> 这样顶层目录永远等于“当前有效的层”，不会出现新旧两套并存。

## 3. 四层内容模型

```text
第 1 层  元协议        vendor/meta-protocols/<id>    定义“如何声明、发现、协商”
第 2 层  子协议        vendor/sub-protocols/<id>     在元协议之上定义具体领域行为
第 3 层  范例实现      vendor/examples/<id>          按协议真实做出来的产品
第 4 层  产品准入      profiles/<profile>/           只约束某个产品形态的生态

横切    治理          governance/ decisions/
横切    事实          registry/  （机器可读）+ docs/（人读）
横切    校验          scripts/ + .github/workflows/
```

四层的关系是**单向**的：子协议建立在元协议之上，范例实现遵循某个协议，
Profile 在协议之上约束自己的生态。任何一层都不得修改上一层的语义。

## 4. “我想加 X” 落位速查

| 我想加的东西 | 放哪里 | 必须同步改 |
| --- | --- | --- |
| 一个新的**元协议** | `vendor/meta-protocols/<id>` | `registry/protocols.json`（`category: "meta-protocol"`）、`docs/overview.md`、`vendor/README.md` 挂载表 |
| 一个新的**子协议**（如皮肤 / UI 插件协议） | `vendor/sub-protocols/<id>` | `registry/protocols.json`（`category: "sub-protocol"` + `buildsOn`）、`docs/overview.md`、`vendor/README.md` 挂载表 |
| 一个**范例实现**（如皮肤管理器、插件市场） | `vendor/examples/<id>` | `registry/implementations.json`（`implements` / `role`）、`docs/examples/<id>.md`、`vendor/examples/README.md` |
| 一个**产品准入 Profile** | `profiles/<profile>/` | `registry/profiles.json`、`docs/overview.md` |
| 一条**治理规则** | `governance/rules.md` | `governance/README.md` 索引、`decisions/` 若涉及决策 |
| 一条**决策记录** | `decisions/NNNN-<slug>.md` | `decisions/README.md` 索引 |
| 一次**挂载 revision 升级** | 改动 gitlink | 独立 PR：写明升级原因、兼容性影响、文档同步、上游证据 |
| 一份**上游版本分析** | `docs/upstream-analysis/<dsh 版本>.md` | `docs/README.md` 索引 |
| 本仓库自己的**校验规则** | `scripts/verify-structure.mjs` | `docs/directory-guide.md` §6 规则清单、`CONTRIBUTING.md` |

> 目录本身也要“先登记再使用”：新增顶层目录必须同时更新
> `scripts/verify-structure.mjs` 的 `ALLOWED_TOP_LEVEL` 白名单，否则 CI 报错。
> 这是刻意的摩擦——它让每一次目录扩张都是一次有意识的决定。

## 5. 命名与文件约定

- **条目 id**：小写字母、数字、连字符（`^[a-z0-9][a-z0-9-]*$`），与挂载目录同名；
- **挂载路径**：`vendor/<类别复数>/<id>`，类别复数固定为
  `meta-protocols` / `sub-protocols` / `examples`；
- **索引文件**：`registry/protocols.json`、`registry/implementations.json`、
  `registry/profiles.json`，形状见 [`../registry/schema/index.schema.json`](../registry/schema/index.schema.json)；
- **说明文档**：协议进 `docs/overview.md`（分节），范例进 `docs/examples/<id>.md`（一例一文件）；
- **状态词**：只有 `Draft`、`Experimental`、`Candidate`、`Stable`、`Deprecated`，
  且必须照录上游仓库自己的声明，本仓库不发明状态；
- **路径引用**：文档里引用挂载内容一律用相对路径（`../vendor/...`），不写绝对路径。

## 6. CI 强制的规则

`node scripts/verify-structure.mjs` 会在每次 push / PR 上跑（见
[`../.github/workflows/ci.yml`](../.github/workflows/ci.yml)）：

1. 顶层目录/文件必须在白名单内；
2. `registry/*.json` 能解析，头部字段与文件名一致，条目字段合法、id 唯一；
3. 每条索引的 `mount` 必须出现在 `.gitmodules` 里，且是 gitlink（mode `160000`）；
4. `.gitmodules` 里的每个挂载必须被索引登记，且 URL 与索引的 `upstream` 一致；
5. `category` 与挂载路径前缀必须匹配（§3 的映射）；
6. `vendor/` 下除挂载点与各层 `README.md` 外，不得有本仓库跟踪的文件；
7. 索引与文档里引用的相对路径必须真实存在；
8. 仓库内 Markdown 的相对链接必须能解析到真实文件。

## 7. 预留的扩展点

这些方向尚未落地，但位置已经确定，落地时不需要重新设计目录：

| 方向 | 归属层 | 落位 |
| --- | --- | --- |
| 皮肤 / UI 插件协议（基于 dsh-std） | 子协议 | `vendor/sub-protocols/dsh-skin` + `registry/protocols.json` |
| 皮肤管理器（统一启停、回退） | 范例实现 | `vendor/examples/dsh-skin-manager` + `docs/examples/dsh-skin-manager.md` |
| 插件市场 / 推荐列表 | 范例实现 | `vendor/examples/<market id>` + `docs/examples/<market id>.md` |
| TUI 等产品准入 Profile | 产品准入 | `profiles/<profile>/` + `registry/profiles.json` |
| 上游 DSH 版本影响分析 | 说明文档 | `docs/upstream-analysis/<版本>.md` |
| 跨 Profile 的 conformance 证据 | 事实层 | `registry/` 扩展 + 上游仓库的 conformance 结果引用 |

**自由度红线**：本仓库的任何规范、索引与文档都不得要求某个产品采用固定目录、
固定环境变量或固定管理器；协议可选、实现平等、范例不认证。皮肤协议与皮肤管理器
落地时同样遵守这条：管理器负责统一发现与启停，不负责规定皮肤怎么写。
