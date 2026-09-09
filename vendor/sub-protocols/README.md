# vendor/sub-protocols —— 子协议挂载区（当前为空）

本目录预留给**子协议**：在元协议之上定义具体领域行为的协议仓库。

元协议只回答“如何声明、发现、协商”；子协议回答“某类东西具体怎么协作”。
子协议不修改元协议语义，独立版本化、独立挂载、独立演进。

## 1. 什么样的东西属于这里

- 它建立在某个元协议（如 `dsh-std` 的 `@dsh-std/core`）之上；
- 它定义一类**具体**的生态行为（界面呈现、皮肤、插件市场、资源打包……）；
- 它有自己的上游仓库、自己的维护方、自己的版本与状态；
- 它**不**把某个产品的实现细节变成对所有生态的强制要求。

## 2. 已经可以预期的一个例子：皮肤 / UI 插件协议

生态正在酝酿一类“皮肤 / UI 插件”协议：基于 `dsh-std` 的呈现（Presentation）与
清单（manifest）机制，让皮肤、主题、界面插件用统一坐标声明自己，从而可以被
一个**皮肤管理器**统一发现、安装、启停与回退——而**不约束**任何皮肤的实现自由度：
皮肤仍然可以自己决定用什么渲染技术、什么资源格式、是否依赖某个宿主。

它落地时，位置是确定的：

```text
vendor/sub-protocols/<子协议 id>/          # 协议本体（submodule，固定 revision）
registry/protocols.json                    # category = "sub-protocol" 的索引条目
docs/overview.md                           # 在生态总览里补一节
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

本目录当前没有挂载，因此只有本说明文件；一旦有第一个子协议，请把它的入口链接补到
[`../README.md`](../README.md) 的挂载表。
