# vendor/examples —— 范例实现挂载区

本目录存放**范例实现**：按某个已收录协议真实做出来的产品，用来证明协议不是纸面
文件，而是可以被真实工具按同一套说法描述、发现和管理的。

**范例不是标准。** 一个范例的存在既不代表协议由它定义，也不代表它是唯一管理器，
更不代表被它管理的环境因此安全。

## 1. 当前范例

| 挂载路径 | 上游 | 遵循协议 | 角色 | 说明文档 |
| --- | --- | --- | --- | --- |
| [`dsh-dpx`](dsh-dpx) | [T-Auto/dsh-dpx](https://github.com/T-Auto/dsh-dpx) | `dsh-distribution` | 标准管理范例 | [`../../docs/examples/dsh-dpx.md`](../../docs/examples/dsh-dpx.md) |

`dsh-dpx` 是本仓库目前唯一的范例，也是 `dsh-distribution` 的**标准管理范例**：
它按协议创建、注册、发现、启动多个相互隔离的 DSH 环境，把“一个 DSH 环境如何向
外部说明自己”这件事完整走通了一遍。读它比读规范更快地理解协议要解决什么。

## 2. 范例与协议的关系

```text
协议（vendor/meta-protocols/… 或 vendor/sub-protocols/…）
        │  定义：环境/插件怎么描述自己、怎么被发现
        v
范例（vendor/examples/…）
        │  实现：把描述落到真实目录、注册表、启动器上
        v
其他管理器 / 其他产品
           只要读得懂同一份描述，就能平等地管理同一个环境
```

范例实现只能提供**证据**，不能自我认证，也不能要求其他产品照抄它的目录布局。
协议明确不规定固定目录名、固定环境变量或固定注册位置；`dsh-dpx` 在 Windows 上写的
`HKCU\Software\DSH\DPX` 是它自己的实现 profile，不是通用协议的强制要求。

## 3. 新增范例

1. 它必须**遵循**某个已收录协议（否则先讨论协议本身）；
2. `git submodule add <上游地址> vendor/examples/<id>`，固定 revision；
3. 在 [`../../registry/implementations.json`](../../registry/implementations.json) 加条目，
   写清 `implements`、`role`、状态（照录上游声明）；
4. 写 [`../../docs/examples/<id>.md`](../../docs/examples)：
   它示范了协议的哪几部分、它刻意不做什么、如何复算它的验证结果；
5. `node scripts/verify-structure.mjs` 全绿。
