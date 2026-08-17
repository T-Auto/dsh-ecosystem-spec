# RFC 0004 — Provenance / Validation / Diagnostics

**Status:** Experimental  
**Scope:** Deferred from Community v0.1; TUI evidence and diagnostics research

## 目标

把插件发现/安装和插件解释/排障分开，并且让每个 claim 绑定不可变 artifact、Host Descriptor、spec 和 suite evidence。

## 安装前

可验证数据包括 manifest、dependency graph、artifact digest、requested capability/permission、declared effect、build/install script、patch/native component presence。声明不能冒充 observed fact。

## 运行后

至少可记录 activation instance、runtime generation、registered command/subscription、resource ownership、error provenance 和 cleanup result。effect ledger 禁止记录消息正文、凭据、token 或 secret；只能记录稳定引用或不可逆 digest。

## Evidence

必须区分 `Declared`、`Parsed`、`Negotiated`、`Tested`、`Observed`、`Attested`。claim schema 位于 `schemas/conformance-claim.schema.json`。digest 证明字节完整性，不证明发布者身份；签名/attestation 另行定义。

在 provenance RFC 完成前，TUI Verified 只能声称“绑定指定资产和测试套件的实验验证”，不得声称安全、无漏洞或官方认证。
