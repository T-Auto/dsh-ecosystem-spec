# Community v0.15 baseline

**Status:** Experimental dependency profile
**Normative source:** [dsh-std](https://github.com/Yan-Zero/dsh-std)
**Pinned source:** [`vendor/dsh-std`](../vendor/dsh-std)

本仓库不再复制 Community v0.15 的 Manifest、元协议、composition 与 lifecycle 规范。dsh-TUI admission v0.15 使用下列 dsh-std 文档和机器资产作为公共基线：

- [`@dsh-std/core` 元协议](../vendor/dsh-std/docs/proposals/core.zh.md)；
- [`@dsh-std/manifest` 与 Community v0.15 Manifest](../vendor/dsh-std/docs/proposals/manifest.zh.md)；
- [`@dsh-std/composition`](../vendor/dsh-std/docs/proposals/composition.zh.md)；
- [`@dsh-std/lifecycle`](../vendor/dsh-std/docs/proposals/lifecycle.zh.md)；
- [`@dsh-std/command`](../vendor/dsh-std/docs/proposals/command.zh.md)；
- [`@dsh-std/storage`](../vendor/dsh-std/docs/proposals/storage.zh.md)；
- [`@dsh-std/messages`](../vendor/dsh-std/docs/proposals/message-observer.zh.md)；
- [`@dsh-std/presentation`](../vendor/dsh-std/docs/proposals/presentation.zh.md)；
- [Community v0.15 Manifest schema](../vendor/dsh-std/packages/manifest/schema/dsh-plugin-0.15.schema.json)。

submodule revision 是本仓库 conformance suite 的规范依赖版本。更新该 revision 时，必须同时运行本仓库测试并记录 admission 行为变化。

本仓库继续规范以下增量内容：

- [`dsh-TUI Admission v0.15`](tui-admission-v0.15.md) 的产品准入要求；
- Host Descriptor、验证声明与 effect ledger 的 TUI profile；
- `registry/registry-0.15.json` 收录的 TUI 私有 protocol definitions；
- `x-ccch1mneyyy.tui/*` 私有协议。

这些增量必须通过 dsh-std 的 `ProtocolCatalog`、Manifest projection、composition 与 lifecycle 机制参与协商和激活。私有命名空间不产生第二套协议系统，也不改变 dsh-std 公共协议的语义。
