# RFC 0003 — Service Composition

**Status:** Experimental  
**Scope:** Deferred from Community v0.1

## 目标

使插件依赖能力而不是依赖具体插件，例如：

```text
Plugin A provides git.client
Plugin B requires git.client
```

## 当前边界

Community v0.1 schema MUST reject `provides` 和 `requires.services`。当前 TUI 只能将其作为实验 profile，不能把它当作稳定兼容要求。

## 晋级前必须定义

- provider cardinality；
- deterministic selection policy；
- health 和 replacement；
- conflict plan；
- provider scope 和 activation instance ownership；
- shutdown / cleanup；
- provider 缺失、重复、故障和撤销的稳定错误码；
- 多宿主 conformance fixtures。

加载顺序不能成为 provider 仲裁机制。未完成上述 contract 前，任何实现都不得对外声称 Community v0.1 service compatibility。
