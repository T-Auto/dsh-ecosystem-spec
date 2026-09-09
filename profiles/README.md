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

## 2. 当前状态

尚未收录 Profile。重构前的 TUI 准入内容（原 `docs/plugin-admission-and-development.md`、
`conformance/`、`registry/`）已移出工作树，需要时从 git 历史取回
（[`decisions/0001-remove-legacy-archive.md`](../decisions/0001-remove-legacy-archive.md)），
迁移时应：

1. 在 `profiles/dsh-tui/` 下重建为独立 Profile 文档；
2. 在 `registry/profiles.json` 登记条目（状态照录归属方声明）；
3. 保持 `TUI-*` 编号稳定，不把 TUI 要求写成全生态要求；
4. 一次 PR 只做迁移，不顺带改语义。

## 3. 与其它层的关系

```text
元协议 / 子协议       定义通用语义（vendor/ 下挂载）
        ↓
Profile               在通用语义之上加产品准入（本目录）
        ↓
实现与证据            由各产品与范例提供（vendor/examples/ 等）
```

Profile 不定义协议，只定义“某类产品要进入某个生态时，额外需要满足什么、怎么被验证”。
