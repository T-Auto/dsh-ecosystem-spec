# dsh-TUI Plugin Admission Checklist

这是 TUI 团队进行插件生态准入的机器/人工联合检查表。逐项要求 ID 见 `spec/tui-admission-v0.1.md`。

## A. 包与身份

- [ ] `TUI-PKG-001`：根目录唯一 `dsh-plugin.json`
- [ ] `$schema` 可解析，manifest schema 通过
- [ ] plugin `id` 稳定且唯一，version 合法
- [ ] manifestVersion / apiVersion 明确
- [ ] source repository、license 可定位
- [ ] Verified artifact digest 可验证，依赖/产物 digest 与 claim 绑定

## B. 声明完整性

- [ ] `TUI-PKG-002`：required/optional capability、permissions、subscriptions、contributes 全部声明
- [ ] capability/event/permission 均存在于 registry 且 hash 一致
- [ ] 不声明 `provides` 或 `requires.services`
- [ ] command contribution ID 无冲突

## C. TUI 兼容性

- [ ] `TUI-HOST-001`：TUI Host Descriptor negotiation 通过
- [ ] `TUI-RUN-001`：headless、remote/local 和 Presentation 边界明确
- [ ] 不假设本机存在 GUI 或浏览器
- [ ] 不在 activation 时缓存单一 Presentation
- [ ] 声明 remote attach 时通过对应 profile 测试

## D. 运行时行为

- [ ] `TUI-OBS-001`：activation 顺序和 runtime generation scope 符合 contract
- [ ] 重复 activation 行为确定，异常不破坏 Broker 生命周期
- [ ] 注册资源可定位到 activation instance
- [ ] cleanup 结果可观测且失败可重试

## E. 清理与恢复

- [ ] `TUI-OBS-002`：deactivate / uninstall / purge 语义区分
- [ ] grant、subscription、Broker resource 能撤销
- [ ] 残留资源不会被报告为完全卸载
- [ ] 配置、缓存、storage 和 native/build 产物的保留/删除策略明确

## F. 信任与声明

- [ ] `TUI-RUN-002`：展示 trusted-in-process 和非沙箱警告
- [ ] `TUI-DEP-001`：Reproducible 的依赖闭包和 digest 证据完整
- [ ] `TUI-CLAIM-001`：claim 绑定 spec/host/artifact/suite/result
- [ ] effect ledger 不记录 secret、credential、token 或消息正文

## G. 市场展示

- [ ] compatibility decision、verification level、restrictions 分开显示
- [ ] 明确显示 capability、permission、依赖和 TUI-only limitation
- [ ] 不使用“官方认证”“安全插件”等未授权措辞
