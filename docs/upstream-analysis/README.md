# Upstream Analysis — DSH Core 版本变动分析

> 本目录持续记录 DeepSeek Harness / DSH 核心版本变动对社区生态的影响。
> 这是给读者的导引，也是给维护者的检查清单。
> 所有分析均表述为“社区观察/影响评估”，不声称官方认可。

## 维护说明

- 每次 DSH 核心版本发布后，新增 `dsh-<版本>.md`；
- 使用 [`template.md`](template.md) 填写；
- 分析 `dsh-std`、adapter、Profile、conformance 的受影响面；
- 评估是否需要升 `vendor/dsh-std` submodule、新增协议版本、更新 TUI 挂载；
- 将结果链接到本索引、[`../overview.md`](../overview.md) 和对应 adapter note；
- 若影响公共协议，走 [`rfc/`](../../rfc/README.md) 提案；若只影响 TUI，走
  [`proposals/`](../../proposals/tui-proposals.md)。

## 索引

| 分析文档 | 上游版本 | 状态 | 一句话结论 |
| --- | --- | --- | --- |
| [dsh-0.1.2-alpha.1.md](dsh-0.1.2-alpha.1.md) | 0.1.2-alpha.1 | Draft | 上游模块化继续加深，生态需要外部事实层承接 domain/event/extension/profile 事实；当前 dsh-tui adapter 主校验线已对齐该版本 |
| [dsh-0.1.2-alpha.2.md](dsh-0.1.2-alpha.2.md) | 0.1.2-alpha.2 | Draft | DSH 继续朝契约优先、领域所有权、可组合 profile 方向演进；方向利好，但 adapter-dsh 仍需迁移旧 client runtime 才能真正跑在 alpha.2 上 |

## 首批待补目录

以下版本可从上游 release / changelog 回溯后补写，当前不阻塞正文：

```text
dsh-0.1.0-experimental
dsh-0.1.0-rc.6
dsh-0.1.0-rc.7
dsh-0.1.0-rc.8
dsh-0.1.1-rc.1
dsh-0.1.1-rc.2
```
