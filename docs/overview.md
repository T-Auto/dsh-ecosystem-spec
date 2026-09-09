# 生态总览

> **定位**：本文帮助第一次接触的读者理解 DSH 社区生态的组成、分层与边界。
> **非官方声明**：本体系是社区生态入口，不声称 DeepSeek 官方认证、官方采用或唯一标准。

## 1. 这个项目是干什么的

`dsh-ecosystem-spec` 是 DSH 社区生态的**规范入口与事实层**：

- 记录生态里有哪些协议、有哪些范例实现、谁声明了什么状态；
- 把协议正文**挂载**引用（git submodule 固定 revision），不复制、不改写；
- 用 `registry/` 提供机器可读索引，用 `docs/` 提供人读说明；
- 用本仓库自己的 CI 保证“索引 ↔ 挂载 ↔ 文档”三者一致；
- 把具体产品形态的准入要求作为 **Profile** 管理，只约束自己声明的生态范围。

官方仓库回答“我们自己的实现是什么”；本仓库回答“整个社区生态是什么、谁实现了什么、
如何验证、如何演进”。

## 2. 四层内容模型

```text
第 1 层  元协议      vendor/meta-protocols/<id>    定义“如何声明、发现、协商”
第 2 层  子协议      vendor/sub-protocols/<id>     在元协议之上定义具体领域行为
第 3 层  范例实现    vendor/examples/<id>          按协议真实做出来的产品
第 4 层  产品准入    profiles/<profile>/           只约束某个产品形态的生态
```

- **元协议**（`@dsh-std/core`、`dsh-distribution`）本身不含领域业务字段，它是
  “关于协议的协议”与环境身份协议；
- **子协议**建立在元协议之上，独立版本化、独立演进（例如正在酝酿的皮肤 / UI
  插件协议）；
- **范例实现**用来证明协议可被真实产品按同一套说法描述与管理，它不是标准；
- **Profile** 在协议之上加产品准入规则，必须标注适用范围，不倒灌成所有生态的强制要求。

层与层是**单向**的：下层不得修改上层语义；任何一层都不得把某个产品的实现细节
变成对所有生态的强制要求。

## 3. 当前收录

| 类别 | 条目 | 状态（照录上游） | 挂载 |
| --- | --- | --- | --- |
| 元协议 | `dsh-std` | Draft | [`vendor/meta-protocols/dsh-std`](../vendor/meta-protocols/dsh-std) |
| 元协议 | `dsh-distribution` | Draft | [`vendor/meta-protocols/dsh-distribution`](../vendor/meta-protocols/dsh-distribution) |
| 范例实现 | `dsh-dpx` | Experimental | [`vendor/examples/dsh-dpx`](../vendor/examples/dsh-dpx) |
| 子协议 | —— 尚未收录 | —— | `vendor/sub-protocols/` |
| Profile | —— 尚未收录 | —— | `profiles/` |

机器可读版本见 [`registry/protocols.json`](../registry/protocols.json) 与
[`registry/implementations.json`](../registry/implementations.json)。

## 4. 生态角色与边界

| 角色 | 拥有 | 不拥有 |
| --- | --- | --- |
| `dsh-std` | 公共协议定义、声明/发现/协商机制、参考包 | 不定义产品准入；不自我认证 |
| `dsh-distribution` | 环境身份、受控布局、发现与可迁移性协议 | 不是安装器、不是运行时、不是指定管理器 |
| `dsh-ecosystem-spec` | 入口、索引、说明、治理、本仓库 CI | 不重新定义协议语义；不认证实现；不替官方表态 |
| 各实现 / 范例 | 实现、conformance 证据、使用经验 | 不能自称官方实现，不能自我认证 |

## 5. 为什么是去中心化的

DSH 生态天然是“多种宿主 / 多种终端 / 多种市场 / 多种实现 / 多种社区仓库”。
如果由单一仓库、单一产品或单一组织定义“生态标准”，就会把某个产品的限制变成
全生态限制。因此本体系坚持：

1. **权威跟随资产**：谁拥有协议、仓库与市场，谁对自己的资产有决定权；
2. **公共协议只定义最小共识**：元协议只声明和协商，不预设未来形态；
3. **Profile 只约束自己**：产品规则标注适用范围，不要求其他宿主采用；
4. **多个 registry / market / catalog 可以并存**：本仓库记录事实，不任命唯一市场；
5. **官方可以自由演进**：社区通过 adapter 与新协议版本吸收变化，不请求官方冻结内部接口。

## 6. 使用这些协定能得到什么

- **可互操作**：统一坐标、声明、发现与协商；
- **可验证**：conformance、fixtures、证据可复算；
- **可演进**：元协议与子协议分层演进；
- **可适配**：上游变化收敛到 adapter；
- **可共存**：多套 DSH 环境在同一台机器上互不污染、可被同一类工具识别；
- **可追溯**：索引、claim、ledger、决策都有记录。

## 7. 当前状态与边界

- 两个元协议均处于上游自称的 **Draft** 阶段，`dsh-dpx` 为 **Experimental**；
- 重构前的 TUI 时代内容（准入规范、conformance、registry contracts、adapters、RFC 等）
  已移出工作树，需要时从 git 历史取回，见
  [`decisions/0001-remove-legacy-archive.md`](../decisions/0001-remove-legacy-archive.md)；
- **capability / permission 不是安全边界**；任何证据都不是“安全插件”或“官方认证”；
- **参考实现不是标准**；实现存在不能自我认证。

## 8. 如何参与

| 我想做什么 | 去这里 |
| --- | --- |
| 快速理解生态 | 本文 |
| 知道东西该放哪 | [`directory-guide.md`](directory-guide.md) |
| 查机器可读索引 | [`../registry/README.md`](../registry/README.md) |
| 看挂载区 | [`../vendor/README.md`](../vendor/README.md) |
| 理解 `dsh-dpx` 这个范例 | [`examples/dsh-dpx.md`](examples/dsh-dpx.md) |
| 提公共协议变更 | 到对应协议仓库（见 `registry/protocols.json` 的 `upstream`） |
| 参与治理与决策 | [`../governance/README.md`](../governance/README.md)、[`../decisions/README.md`](../decisions/README.md) |
| 提交代码 / 文档 | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) |
