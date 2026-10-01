# vendor/sub-protocols —— 子协议挂载区

本目录存放**子协议**挂载：在元协议之上定义具体领域行为的协议仓库。

元协议只回答“如何声明、发现、协商”；子协议回答“某类东西具体怎么协作”。
子协议不修改元协议语义，独立版本化、独立挂载、独立演进。

## 1. 什么样的东西属于这里

- 它建立在某个元协议（如 `dsh-std` 的 `@dsh-std/core`）之上；
- 它定义一类**具体**的生态行为（界面呈现、皮肤、插件市场、资源打包……）；
- 它有自己的上游仓库、自己的维护方、自己的版本与状态；
- 它**不**把某个产品的实现细节变成对所有生态的强制要求。

## 2. 当前子协议：dsh-skin（DSH UI 皮肤加载公约）

生态收录的第一个子协议已落地：[`dsh-skin/`](dsh-skin)（上游
[DSH-EAC/dsh-ui-skin-loader-convention](https://github.com/DSH-EAC/dsh-ui-skin-loader-convention)，
协议 id `dsh.ecosystem.ui-skin-loader/v1`）。它是一份**弱约束**公约：只定义皮肤
插件与加载器之间的最小接缝——皮肤不占用什么、何时被启用、收到什么、何时必须
彻底关闭；不定义包格式，不约束皮肤内部实现，不做宿主特化。它基于 `dsh-std`
（索引条目 `buildsOn`），落位即本目录预留的位置：

```text
vendor/sub-protocols/dsh-skin/             # 协议本体（submodule，固定 revision）
registry/protocols.json                    # category = "sub-protocol" 的索引条目
docs/overview.md                           # 在生态总览里分节说明
```

对应的管理器属于**范例实现**，挂到 `vendor/examples/`，并配
`docs/examples/<id>.md`；协议本体与范例实现是两个仓库、两条索引、两份文档，
不混在一起。

## 3. 新增子协议挂载

1. 确认它不属于元协议、也不只是某个产品的实现（否则应放
   [`../meta-protocols/`](../meta-protocols) 或 [`../examples/`](../examples)）；
2. `git submodule add <上游地址> vendor/sub-protocols/<id>`，固定 revision；
3. 在 [`../../registry/protocols.json`](../../registry/protocols.json) 加 `category: "sub-protocol"` 条目，
   `buildsOn` 写出它依托的元协议 id；
4. 在 [`../../docs/overview.md`](../../docs/overview.md) 与
   [`../../docs/directory-guide.md`](../../docs/directory-guide.md) 的清单里同步；
5. `node scripts/verify-structure.mjs` 全绿。

当前唯一挂载 `dsh-skin` 的入口链接已补入 [`../README.md`](../README.md) 的挂载表；
以后每个新子协议照此办理。
