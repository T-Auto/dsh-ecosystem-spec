# Specification Writing Rules

本文件约束 `dsh-ecosystem-spec` 自身，防止“规范规范着规范又乱了”。

## 1. Normative language

Community Consensus 与 TUI Admission 使用以下术语：

- **MUST / 必须**：不满足即不符合规范；
- **MUST NOT / 禁止**：不满足即违规；
- **SHOULD / 应**：一般要求；只有明确理由才能偏离；
- **SHOULD NOT / 不应**：一般不允许；
- **MAY / 可以**：实现自主选择。

“建议”“最好”“尽量”不能单独承担 normative requirement。

## 2. 文档分区规则

### `spec/`

只能放已经形成版本化 contract 的文本。

### `rfc/`

放独立主题的技术提案。

### `proposals/`

放 TUI 独有、实验性或尚未完成治理的方向。

### `governance/`

只放治理与角色边界。

### `conformance/`

只放验证、fixtures、证据与结果定义。

### `registry/`

只放机器可读 contract 的注册与生命周期规则。

### `adapters/`

只放 Adapter Note：某一宿主/运行时版本（如 dsh/Cordis 的具体版本）与公共 contract 的适配细节。Adapter Note 不改变标准语义，不被其他宿主要求遵守。

## 3. 禁止越权写法

任何文档不得使用以下含义不清的句子：

- “官方标准规定”；
- “dsh 官方认证”；
- “TUI 验证所以安全”；
- “Fabric 就是标准实现”；
- “所有 dsh 插件都必须遵守”。

除非存在明确的官方文件或治理决定，否则必须改写为：

- “community draft”；
- “TUI admission policy”；
- “reference implementation”；
- “experimental proposal”。

## 4. 每项规范必须绑定测试

新加一个 MUST / MUST NOT 时，必须同时指出：

- schema / contract 在哪里；
- fixture 在哪里；
- conformance test 如何证明；
- 失败时市场/Host 如何展示。

如果不能写出测试，默认状态为 `Proposal`，不得直接放入 Stable spec。

## 5. 每项能力必须有边界

写一个 capability 时必须回答：

1. 它解决什么问题；
2. 谁可以调用；
3. 需要什么授权；
4. 输入 / 输出 schema；
5. 生命周期；
6. 错误语义；
7. 并发 / 超时；
8. cleanup / rollback；
9. privacyClass；
10. 是否构成安全边界。

## 6. 不允许把实现细节冒充 contract

以下内容属于实现层，不能直接成为公共规范：

- 内部函数名；
- private service id；
- mixin target；
- DOM / React / Ink / Node 内部 API；
- 某一版本 dsh 的具体调用栈。

Adapter 可以依赖这些东西，但插件 contract 不可以。

## 7. 每项 breaking change 必须写迁移

至少包含：

```text
Affected versions
Old contract
New contract
Migration path
Compatibility window
Removal date
```

不能仅写“更新到新版即可”。

## 8. TUI 提案特别要求

TUI 提案必须明确：

```text
Proposal ID
Status
Reason for TUI-specific scope
Community dependency
Experimental capability name
Entry criteria
Exit criteria
Rollback plan
```

未完成退出条件前，不得移动到 `spec/community-consensus-*`。
