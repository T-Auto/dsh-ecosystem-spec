# registry —— 生态索引（机器可读）

本目录是 `dsh-ecosystem-spec` 作为**生态入口**的数据层：用机器可读的方式登记
“生态里有哪些协议、有哪些范例实现、有哪些产品准入 Profile，它们的正文来源在哪里”。

人和 CI 都读这里。CI 每次提交都会校验索引与 `.gitmodules`、挂载目录、文档路径三者一致
（见 [`../scripts/verify-structure.mjs`](../scripts/verify-structure.mjs)）。

## 1. 索引登记什么、不登记什么

登记事实：

- 条目 **id**、显示名、类别（元协议 / 子协议 / 范例实现 / Profile）；
- **上游仓库**与维护方；
- 协议与范例在本仓库的**挂载路径**（git submodule），或外部 Profile 的固定 `source`；
- **状态 / 成熟度口径**——照录上游或 Profile 归属方自己的声明，索引不发明状态；
- 说明文档路径。

不登记、也不代表：

- 不授予状态：`Candidate` / `Stable` 只能来自协议主管仓库的声明；
- 不认证实现：范例存在不等于被认证、不等于安全；
- 不规定目录：索引描述事实，不要求任何产品长成某种目录形状；
- 不替代协议自身的 registry：例如 `vendor/meta-protocols/dsh-distribution/registry/protocols.json`
  是那个仓库自己的协议目录，与本目录不是同一个东西。

## 2. 三个索引文档

| 文件 | 内容 | 形状 |
| --- | --- | --- |
| [`protocols.json`](protocols.json) | 收录的元协议与子协议 | [`schema/index.schema.json`](schema/index.schema.json) → `protocolEntry` |
| [`implementations.json`](implementations.json) | 收录的范例实现 | `schema/index.schema.json` → `implementationEntry` |
| [`profiles.json`](profiles.json) | 产品准入 Profile | `schema/index.schema.json` → `profileEntry` |

三个文档共享同一个头部字段集合：

```json
{
  "$schema": "./schema/index.schema.json",
  "document": "protocols",
  "version": 1,
  "updated": "YYYY-MM-DD",
  "scope": "这份索引说明自己收录什么",
  "entries": []
}
```

协议与范例的状态词与治理层一致，只有五个：`Draft`、`Experimental`、`Candidate`、`Stable`、`Deprecated`。
Profile 选择传统的上游 `status` 分支，或归属方的 `maturityPolicy.kind: "not-applicable"`
与固定 `source` 分支；两者不得混用。`not-applicable` 不是额外的成熟度状态，
也不表示已测试、兼容或认证。

外部 `source` 固定 `repository`、完整 40 位 commit `revision` 和仓库内相对 `path`；
`contentDigest` 是该 revision/path 的**单个文件原始字节**的 `sha256:` 摘要，
不是整个 Profile 目录、仓库树或 conformance 结果的摘要。还需记录适用的
`productVersions`、声明的 `imports` 与 `suite` id/version。依据见
[`ADR 0002`](../decisions/0002-external-profile-source-identity.md)。

## 3. 类别与挂载路径的对应关系

类别不是标签，它直接决定挂载位置（由 CI 强制）：

| `category` | 挂载路径前缀 | 含义 |
| --- | --- | --- |
| `meta-protocol` | `vendor/meta-protocols/<id>` | 定义“如何声明、发现、协商”的元协议 |
| `sub-protocol` | `vendor/sub-protocols/<id>` | 在元协议之上定义具体领域行为的子协议 |
| `example` | `vendor/examples/<id>` | 范例实现 |
| `profile` | 不挂载（正文可在本仓库或归属方仓库） | 产品准入 Profile |

完整规则与新增步骤见 [`../docs/directory-guide.md`](../docs/directory-guide.md)。

## 4. 新增一条索引需要改什么

1. 协议 / 范例在 `vendor/` 下按类别挂载上游仓库（submodule，固定 revision）；
   Profile 不挂载：本地正文按 [`profiles/README.md`](../profiles/README.md) 落位，
   外部正文登记固定 `source`；
2. 在对应的索引文档里加一条 `entries` 记录；
3. 用 `doc` 指向说明文档（范例实现与 Profile 必须有，协议条目可选）；
4. 本地跑 `node scripts/verify-structure.mjs`，全绿再提 PR。

一次 PR 只做一类事：新增挂载、修订索引、修订说明文档不要混在一起
（见 [`../CONTRIBUTING.md`](../CONTRIBUTING.md) 的“禁止顺手规范化”）。
