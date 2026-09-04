# RFC 0000 — Ecosystem Governance

**Status:** Experimental

## 定位

本 RFC 只用于社区规范演进，不要求 dsh 官方立即采纳。

## 提案类型

- Community RFC：改变跨宿主公共 contract；
- TUI Proposal：改变 TUI 产品生态规则或提出实验能力；
- Adapter Note：记录某一 dsh/Cordis 版本的适配细节，不改变标准语义。

## 决策门槛

Community RFC MUST 提供问题、可复现实例、API/schema 草案、兼容分析、fixtures、conformance strategy 和迁移说明。批准前只能标记 Draft/Experimental，不能进入 Stable。

## 参考实现

参考实现可以验证可行性、提供 fixtures/benchmark/evidence，但不能用实现行为替代规范文本，不能因实现存在自动成为标准，不能自授“官方认证”。

## 冲突与优先级

同一版本中，以正式 spec 文本和其 normative assets 为准；registry/schema hash 不一致时 fail closed。加载顺序不得仲裁 contribution/provider 冲突。
