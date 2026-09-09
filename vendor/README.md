# vendor —— 挂载区

本目录存放**外部仓库的挂载**：用 git submodule 把协议仓库和范例实现仓库固定在
某个 revision 上引用，而不是把内容复制进本仓库。

挂载是本仓库作为“生态入口”的物理形态：入口负责**索引、说明、校验与治理**，
协议与实现的正文永远留在它们自己的仓库里，由各自的维护方演进。

## 1. 目录约定

```text
vendor/
├── meta-protocols/          # 元协议：定义“如何声明、发现、协商”
│   ├── dsh-std/             → Yan-Zero/dsh-std
│   └── dsh-distribution/    → T-Auto/dsh-distribution
├── sub-protocols/           # 子协议：在元协议之上定义具体领域行为
│   └── (预留)
└── examples/                # 范例实现：证明协议可被真实产品按同一套说法管理
    └── dsh-dpx/             → T-Auto/dsh-dpx
```

类别决定路径，路径由 [`../scripts/verify-structure.mjs`](../scripts/verify-structure.mjs)
强制：索引里写 `category`，挂载就必须落在对应的前缀下，写错 CI 直接红。

## 2. 当前挂载

| 挂载路径 | 类别 | 上游 | 索引条目 | 说明文档 |
| --- | --- | --- | --- | --- |
| [`meta-protocols/dsh-std`](meta-protocols/dsh-std) | 元协议 | [Yan-Zero/dsh-std](https://github.com/Yan-Zero/dsh-std) | [`registry/protocols.json`](../registry/protocols.json) | [`docs/overview.md`](../docs/overview.md) |
| [`meta-protocols/dsh-distribution`](meta-protocols/dsh-distribution) | 元协议 | [T-Auto/dsh-distribution](https://github.com/T-Auto/dsh-distribution) | [`registry/protocols.json`](../registry/protocols.json) | [`docs/overview.md`](../docs/overview.md) |
| [`examples/dsh-dpx`](examples/dsh-dpx) | 范例实现 | [T-Auto/dsh-dpx](https://github.com/T-Auto/dsh-dpx) | [`registry/implementations.json`](../registry/implementations.json) | [`docs/examples/dsh-dpx.md`](../docs/examples/dsh-dpx.md) |

挂载固定到具体 revision（gitlink 就是唯一事实来源）。本仓库**不复制**上游正文，
因此不存在“本仓库的 std 副本”与上游漂移的问题。

## 3. 使用挂载

首次克隆后初始化挂载（网络走本机 Clash 代理）：

```powershell
git submodule update --init --recursive
```

只读引用即可满足阅读与校验；要构建某个协议仓库，请进入该挂载目录按它自己的
文档执行（例如 dsh-std 的 `pnpm check`、dsh-distribution 的 `pnpm check`）。

## 4. 新增一个挂载

完整流程见 [`../docs/directory-guide.md`](../docs/directory-guide.md)。要点：

1. 判断类别（元协议 / 子协议 / 范例实现）——类别由它在生态里的**职责**决定，
   不由仓库大小或作者决定；
2. 挂到 `vendor/<类别>/<id>`，submodule URL 用上游 GitHub 地址；
3. 在 `registry/` 对应索引里登记，状态照录上游声明；
4. 范例实现必须补 `docs/examples/<id>.md` 说明；
5. `node scripts/verify-structure.mjs` 全绿。

## 5. 升级挂载的 revision

挂载升级是**一次独立 PR**：说明升级原因、受影响的协议坐标与兼容性影响、
本仓库文档是否需要同步，并附上上游验证证据。不要和新增条目、文档改写混在同一次提交里。

`old/vendor/dsh-std` 是重构前归档区里的历史挂载，只读保留，不参与现行索引。
