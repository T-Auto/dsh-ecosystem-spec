# DSH Core 版本变动分析：<版本号>

- 上游版本：<version>
- 发布日期：<date>
- 上游 commit / tag：<sha>
- 上游 release / changelog：<链接>
- 分析日期：<date>
- 分析人：<name>
- 状态：Draft / Reviewed / Superseded

## 一句话影响

<这个版本对 dsh-std、adapter、TUI Profile、插件生态的总体影响。>

## 上游变更摘要

| 领域 | 变更 | 是否影响公共协议 |
| --- | --- | --- |
| 架构 | ... | 否 / 是 |
| 插件接缝 | ... | 是 / 否 |
| 事件 | ... | 是 / 否 |
| 配置 | ... | 否 |
| 包边界 | ... | 是 |
| 其他 | ... | 待确认 |

## 对 dsh-std 的影响

- 公共协议是否需要新版本？
- 哪些协议坐标需要重新评估？
- 哪些 validator / schema / fixtures 需要更新？

## 对 adapter 的影响

- 上游类型 / 内部面是否变化？
- adapter 需要新增映射还是删除映射？
- 是否存在“语义无法保持”的变更？

## 对 Profile / TUI 的影响

- TUI Admission 是否需要调整？
- 权限、manifest、插件生命周期是否受影响？
- 市场展示、evidence、conformance 是否需要变化？

## 对生态实现的影响

- 哪些实现需要更新？
- 是否会产生兼容窗口？
- 是否需要迁移指南？

## 验证与证据

- 跑了哪些 conformance？
- 有无新增 / 修改 fixtures？
- 有无独立复现结果？

## 结论与建议

- 是否需要新 RFC / 新协议版本 / 新 Profile PR？
- 是否需要升 `dsh-std` submodule？
- 是否需要更新 TUI main/next 的挂载？
- 建议优先级 / 是否阻塞。

## 迁移与回滚

- 受影响版本范围；
- 迁移路径；
- 回滚方式；
- 弃用窗口。
