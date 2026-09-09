# 治理细则

> 总纲见 [`README.md`](README.md)。本文件是可直接引用的规则条目。

## 1. 来源（Sources）

- 挂载在 `vendor/meta-protocols/` 与 `vendor/sub-protocols/` 的协议仓库是公共协议基线；
- 挂载在 `vendor/examples/` 的仓库只能提供**证据**，不能定义标准；
- 本仓库的 `docs/`、`registry/`、`governance/` 只做入口、索引与治理，不改协议语义。

当前所有收录内容均为 `Draft` 或 `Experimental`，不代表 DSH 官方接受、认证或背书。

## 2. 状态（Status）

正式状态为 `Draft`、`Experimental`、`Candidate`、`Stable`、`Deprecated`。

- 索引中的状态必须与上游仓库的声明一致，且标注 `statusSource: "upstream"`；
- 本仓库不自行晋级任何条目；
- 上游把状态改为 `Stable` 后，本仓库以**独立 PR** 更新索引并记录依据。

## 3. 挂载与索引（Mounts）

- 挂载一律使用 git submodule，URL 为上游 GitHub 地址，固定在具体 revision；
- 每条挂载必须且只能有一条索引记录；类别与挂载路径前缀必须匹配；
- 挂载 revision 升级是独立 PR：写明升级原因、受影响协议坐标、兼容性影响、
  文档同步项与上游验证证据；
- 不得在本仓库复制协议仓库的 schema 后以同一名称维护。

## 4. 命名空间（Namespaces）

- 产品自有协议使用自己的命名空间（例如 TUI 生态使用 `tui.dsh/*`），通过
  `apiVersion + kind` 坐标注册到相应协议的 catalog；
- 新 definition 必须提供协议坐标、专属校验与协商器、contract profile、
  immutable digest 与 fixtures；
- 目录或 package 的存在**不等于** live support。

## 5. 证据（Evidence）

参考实现与宿主只能提供 evidence，不能自我认证。claim 应绑定协议 revision、
profile、宿主、artifact 与 suite，并区分 declared、parsed、negotiated、tested、
observed 与 attested。**任何 evidence 都不是安全保证。**

## 6. 自由度红线

任何收录条目、规范或文档都不得要求某个产品采用固定目录、固定环境变量、
固定注册位置或固定管理器。协议可选、实现平等、范例不认证。
皮肤 / UI 插件协议与皮肤管理器落地时同样遵守：管理器统一发现与启停，
不规定皮肤怎么写。

## 7. 校验（Verification）

本仓库自己的规则由 [`../scripts/verify-structure.mjs`](../scripts/verify-structure.mjs)
在 CI 中强制（清单见 [`../docs/directory-guide.md`](../docs/directory-guide.md) §6）。
规则变更必须同时更新脚本与该清单。
