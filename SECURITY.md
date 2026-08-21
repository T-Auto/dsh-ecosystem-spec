# Security Policy

本仓库采用 dsh-std 基线，并以 `trusted-in-process` 运行 TUI admission profile，不提供 sandbox 或 OS 权限隔离。不要把 protocol declaration、permission、Manifest 校验或 conformance claim 当作安全保证。

请不要在 issue 中公开提交凭据、token、私有插件产物或包含消息正文的 ledger。涉及泄露、供应链替换、digest 校验绕过或敏感数据进入日志的问题，请通过仓库维护团队的私下安全渠道报告，并附最小复现、规范版本、artifact digest 和测试环境。

## 事件响应流程（RFC 0009）

供应链相关事件（恶意重发、依赖闭包注入、发布者账号失陷、digest 变化）按 `rfc/0009-supply-chain-incident-response.md` 处理。TUI 侧动作摘要：

1. **报告受理**：任何渠道的供应链报告进入私下安全渠道，记录报告人、时间、受影响坐标与版本、可复现材料；
2. **验证分级**：验证 digest 是否改变 / 依赖闭包是否引入未知发行物，按影响分级（阻断 / 高 / 中）；
3. **隔离与撤回**：确认影响的版本发布 retraction（yanked / deleted，见 `registry/retractions-0.15.json`）；作者级隔离按 `TUI-SC-004` 执行；
4. **通知与核查**：发布公告 + 受影响版本清单 + 用户侧可执行核查指令；对外部平台（npm 等）的删除/封锁动作只作请求/配合；
5. **恢复与复验**：处置后复验受影响插件历史版本完整性；发布者信任恢复需满足再准入条件；
6. **沟通纪律**：失陷确认前对外表述保护被失陷作者声誉（"账号可能失陷，不推定主观恶意"）。

响应时限目标（非 MUST）：检出后 24 小时内完成验证分级与 yanked 标记，72 小时内完成公告与核查指令。
