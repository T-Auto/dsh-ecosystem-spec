# profiles —— 产品准入 Profile

本目录承载**产品准入 Profile**：在公共协议之上，为某个具体产品形态定义准入、
兼容、证据与展示规则。

Profile 的硬约束：**只约束自己声明的生态范围**。它不得修改公共协议语义，
不得要求其他宿主或产品采用，也不得把某个产品的实现细节变成全生态要求。

## 1. 目录约定

```text
profiles/
└── <profile id>/            # 例如 dsh-tui
    ├── README.md            # Profile 定位、适用范围、归属方
    └── admission.md         # 准入要求（带稳定的 <PROFILE>-* 编号）
```

要求条目使用稳定编号（例如 TUI 生态使用 `TUI-*`），并说明适用 profile、
影响范围与兼容变化。索引登记在 [`../registry/profiles.json`](../registry/profiles.json)。

Profile 正文归**归属方**所有：它可以在本仓库收录（按上面的目录约定落位），
也可以留在归属方自己的仓库里随产品代码分发。留在归属方仓库时，本仓库只在
索引与说明里照录“归属方 + 正文位置”，不复制正文。

## 2. 当前状态

本仓库**不承载任何 Profile 正文**（`registry/profiles.json` 的 `entries` 为空）。
Profile 由归属方在自己的仓库里维护；需要收录进来时，按 §1 建目录并在索引登记。

已声明的 Profile：

| Profile | 归属方 | 正文位置 |
| --- | --- | --- |
| TUI Profile（终端交互生态的准入与子插件接口） | [ccch1mneyyy/dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI) | 随该仓库代码分发：`tui-profile/`（纯文件，无 submodule 挂载） |

TUI Profile **不是本仓库的社区 RFC**：它随 dsh-TUI 的代码现状随时修订，作为该产品
子插件的参考标注；本仓库不复制它的正文，也不为它发明规范状态。重构前的 TUI 时代
内容（原 `docs/plugin-admission-and-development.md`、`conformance/`、`registry/`、
`rfc/`）仍可从 git 历史取回
（[`decisions/0001-remove-legacy-archive.md`](../decisions/0001-remove-legacy-archive.md)），
但不再计划迁入本仓库。

## 3. 与其它层的关系

```text
元协议 / 子协议       定义通用语义（vendor/ 下挂载）
        ↓
Profile               在通用语义之上加产品准入（本目录）
        ↓
实现与证据            由各产品与范例提供（vendor/examples/ 等）
```

Profile 不定义协议，只定义“某类产品要进入某个生态时，额外需要满足什么、怎么被验证”。
