# dsh-TUI Admission Conformance

本套件验证固定 dsh-std revision 与 TUI profile 的组合行为，不重新实现 dsh-std parser 或 negotiation。

运行：

```sh
git submodule update --init
pnpm test
```

测试会构建 `vendor/dsh-std`，随后：

- 使用 `@dsh-std/manifest` 解析并投影 Community v0.15 Manifest；
- 使用 `@dsh-std/command`、`@dsh-std/storage`、`@dsh-std/messages` 和 `@dsh-std/presentation` 注册 Community v0.15 公共 definitions；
- 将 Community v0.15 补充 definitions 与 TUI 私有 definitions 注册到同一个 `ProtocolCatalog`；
- 校验 Host Descriptor、permission policy、私有 profile digest、event envelope、ledger 和 claim；
- 验证 compatible、degraded、waiting authorization、rejected 与 unknown 的 TUI admission 投影；
- 验证 `x-ccch1mneyyy.tui/v1alpha1` 私有 requirement 能与 Host support 正常协商。

Evidence 必须区分声明、解析、协商、测试、观察与 attestation。任何层级都不得被展示为“安全插件”“无漏洞”“官方认证”或“兼容所有 DSH Host”。
