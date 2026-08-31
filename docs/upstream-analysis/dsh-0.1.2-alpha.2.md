# deepseek-harness 0.1.2-alpha.2 与 dsh-std 对比分析

- 上游版本：`0.1.2-alpha.2`
- 对比基线：`0.1.2-alpha.1`
- 目标 commit：`0a53fb55bea101816fa226bb964ae2bed71c343b`
- 分析日期：2026-08-31
- 状态：Draft
- 定位：社区观察 / 影响评估，不声称官方认可

## 结论

`dsh-v0.1.2-alpha.2` 相对 `dsh-v0.1.2-alpha.1` 的更新，继续把 DeepSeek Harness 内部朝“契约优先、领域所有权分离、可组合 profile、可替换 provider、可发布第三方 bundle”的方向推进。这个方向与 `dsh-std` 的核心目标一致，因此对 `dsh-std` 是**方向性利好**。

但需要区分两层：

- **对 dsh-std 的协议/标准叙事**：利好。DSH 越来越像 dsh-std 设想的可插拔、可组合、以契约而非产品名互操作的生态。
- **对 dsh-std 的实际工程落地**：不是即时利好。alpha.2 没有直接依赖或采用 `@dsh-std/*`，而且 `@dsh-std/adapter-dsh` 目前仍引用已被 DSH 新架构移除的 `@deepseek-ai/dsh-client-runtime`，需要先完成适配器迁移才能真正确认“跑在 alpha.2 上”。

## 审查范围

```text
dsh-v0.1.2-alpha.1  →  dsh-v0.1.2-alpha.2
```

- 目标 tag：`dsh-v0.1.2-alpha.2`
- 目标 commit：`0a53fb55bea101816fa226bb964ae2bed71c343b`
- Release PR：#3334，`release: dsh@0.1.2-alpha.2`
- 规模：约 1604 个文件变更，+27,862 / -14,050 行
- 对比基线：上一发布版 `dsh-v0.1.2-alpha.1`（`cd5ef81`）

> 说明：本次分析的是产品本体与 dsh-std 的关系，不是 dsh-std 自身的代码变更。

---

## 一、alpha.2 中与 dsh-std 同向的架构变化

### 1. Profile / Bundle 体系成为可安装、可发布的插件分层

alpha.2 继续落实并强化“一切产品形态都是 profile，profile 由可安装 bundle 叠加”的模型：

- 每个 profile 是 `$DSH_HOME/profiles/<name>`，通过 `dsh.profile.bundles` 显式排序 bundle 层；
- 每个 bundle 是 npm 包，在 `package.json` 中声明 `dsh.bundle.patch`；
- 启动时统一走 `applyEntryPatches`，用户层 `cordis.patch.yml` 与 `--patch` 覆盖层；
- `dsh plugin --profile <name> add <package>` 成为外部插件/组件的正式安装入口。

**对 dsh-std 的意义：**

`@dsh-std/adapter-dsh` 已经是一个 DSH profile bundle：

```json
"dsh": {
  "bundle": {
    "patch": "./cordis.patch.yml"
  }
}
```

这正是 alpha.2（以及 alpha.1 已确立）的 DSH 原生插件分发形态。alpha.2 在发布、打包、安装布局上的进一步硬化，让标准 adapter 和标准组件作为第三方 bundle 进入 DSH profile 的路径更实际。

**证据：**

- `.agents/notes/implemented/architecture/2026-08-05-profile-plugin-bundles.md`
- `packages/boot/app-boot/src/profile.ts`
- `packages/bundle/*/package.json`
- `apps/cli` 的 profile / pnpm 转发逻辑

---

### 2. Session 事件外部兼容性被保留并加固

alpha.2 有一项明确兼容性决策：保留 `SessionEvent` envelope 上的 `ignorable?: true` 标记，即使仓库内一度没有第一方生产者。

决策要点：

- `ignorable?: true` 继续作为公开事件 envelope 字段保留；
- JSONL、SQLite、API transport、生成目录、测试夹具都保留该字段；
- SQLite 从 schema 19 升到 schema 20，显式保存 `ignorable` 标记；
- 未知事件默认仍然 fail-closed，只有存储记录明确带 `ignorable: true` 时才允许重放；
- 只有等替代机制能同时覆盖第三方插件的生产、持久化、重载、传输，才允许删除该字段。

**对 dsh-std 的意义：**

这和 dsh-std 的 session / event 兼容思路一致：不把“未知事件”一律视为可忽略，也不让第三方外部事件因为不在第一方词汇表里就被整个拒绝。标准协议需要给外部/私有事件留出明确、可机器判定的兼容边界，alpha.2 这次的取舍正是这个方向的产品内版本。

**证据：**

- `.agents/notes/implemented/architecture/2026-08-30-retain-ignorable-external-session-events.md`
- `packages/session/session-persistence-sqlite/resources/sql`（schema 20）
- `packages/session/session-persistence` 的 coordinator 行为

---

### 3. Service Definition / Service Provider 拆分继续推广

alpha.2 继续把“抽象契约”和“具体实现”拆开。典型例子是 job registry：

- `@deepseek-ai/dsh-jobs`：Service Definition，只拥有 `ctx.jobs` 契约、类型、语义和不变式；
- `@deepseek-ai/dsh-jobs-local`：Service Provider，拥有进程内实现、生命周期、准入策略；
- 生产方和消费方只依赖 Service Definition，不依赖具体 Provider；
- 后续替换为持久化、远程或可观测 registry 时，不需要改生产方、控制器或扩展方。

**对 dsh-std 的意义：**

这正是 dsh-std 里“可移植协议包 / 产品适配器 / 具体实现”三层分离的产品内体现。DSH 正在把“一个包既定义契约又绑定实现”的旧模式逐项拆掉，这也降低了未来把 DSH 内部能力映射到 dsh-std 协议包的适配成本。

**证据：**

- `.agents/notes/implemented/architecture/2026-07-26-job-registry-seam.md`
- `packages/jobs/jobs/`（Service Definition）
- `packages/jobs/jobs-local/`（Service Provider）

---

### 4. Session projection 成为强制 reader seam

alpha.2 将 session projection 从“可选注册，缺失时静默降级”改为“宿主 reader 的强制状态”：

- 没有 projection registry 或对应 key 时，必须显式失败，不能默认成空值；
- `stateOf(session, key)` 用于单一类型的宿主状态读取，避免每次全量 snapshot；
- `snapshot()` 只用于批量 carrier；
- 宿主值不直接整包下发到客户端，客户端只消费裁剪后的 view。

**对 dsh-std 的意义：**

这反映了一种“缺少必备能力时 fail loud，而不是悄悄让功能消失”的工程纪律。dsh-std 的协议协商和生命周期也强调不能把“未实现”静默当作“支持”，因此这个方向与 dsh-std 的失败语义一致。

**证据：**

- `.agents/notes/implemented/architecture/2026-08-19-session-projection-mandatory-seam.md`
- `packages/session/session-projection/`

---

### 5. 插件库存开始反映“真实运行组合”，而不是 Loader 表面

alpha.2 让 plugin inventory 不再只投影 `ctx.loader.entries()`，而是同时反映每个 agent preset 的实际 composition：

- `pluginInventory/list` 增加 `agentPresets` 块；
- 每个 preset 显示其 flatten 后的 composition 行；
- 区分“全局看似 disabled，但某个 preset 实际启用”的情况；
- 显示 preset 的 mount 健康状态，而不是只显示文件状态。

**对 dsh-std 的意义：**

`@dsh-std/adapter-dsh` 已经提供“标准组件 inventory”独立标签页，目的也是让标准组件的生命周期可见、可诊断，而不是伪装成 DSH Loader 行。alpha.2 让 DSH 自身的插件库存也走向同样的“展示真实组合”方向，二者理念一致。

**证据：**

- `.agents/notes/implemented/architecture/2026-08-29-plugin-inventory-agent-preset-scopes.md`
- `packages/host/plugin-inventory/`

---

### 6. 发布、依赖面与安装布局被进一步硬化

alpha.2 前后完成的发布体系对 dsh-std 的生态落地很重要：

- `packages/`、`vendor/`、`native/` 三个独立发布序列；
- dsh 预发布版本映射到 `alpha` / `canary` / `next` dist-tag；
- 每个 PR / master push 都跑无凭据的 pack、依赖布局、安装后验证；
- 发布只消费已验证 tarball，并做 registry 幂等 / integrity 校验；
- 发布依赖面策略把“Client bundle 静态输入、Host value import、共享 identity peer”分开处理，降低 npm 安装开销和 peer 中继。

**对 dsh-std 的意义：**

标准 adapter 和标准组件要以第三方 npm bundle 方式进入 DSH，必须依赖 DSH 的插件安装、打包、依赖解析都可靠。alpha.2 在这方面的成熟度越高，dsh-std 的“可安装标准组件”就越接近现实。

**证据：**

- `.agents/notes/implemented/process/2026-08-10-npm-release-sequences.md`
- `.agents/notes/implemented/process/2026-08-26-published-dependency-faces.md`
- `scripts/release/*`
- `.github/workflows/release.yml` / `release-publish.yml`

---

## 二、alpha.2 没有直接采用 dsh-std

需要保持清醒的是：

- 在 alpha.2 源码中未发现对 `@dsh-std/*` 的依赖；
- 未发现 DSH 开始使用 dsh-std 的 `ProtocolCatalog` / `apiVersion + kind` 公共声明层；
- DSH 目前仍是在产品内部做“自己的契约化”，而不是把 dsh-std 作为外部协议权威接入。

因此，alpha.2 对 dsh-std 的利好是**方向和生态位层面**的，不是“DSH 已正式采用 dsh-std”这种直接利好。

---

## 三、适配风险与当前缺口

### 1. `@dsh-std/adapter-dsh` 仍引用已消失的 client runtime

`dsh-std` 当前 `origin/main` 的 adapter 仍依赖旧包：

- `packages/adapter-dsh/src/client.ts`：
  ```ts
  import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
  ```
- `packages/adapter-dsh/package.json`：
  - peer / dev 依赖 `@deepseek-ai/dsh-client-runtime`
  - `dsh.client.inject` 包含 `@deepseek-ai/dsh-client-runtime`
- `packages/adapter-dsh/tsdown.config.ts`：
  - 列出 `@deepseek-ai/dsh-client-runtime/client`

但 DSH 在 alpha.1 阶段已经把 `packages/client/runtime` 解散，alpha.2 也没有恢复该包。现在 DSH 的 client 插件普遍直接使用 `@deepseek-ai/cordis` 的 `Context` 作为 client context，相关能力分散到：

- `packages/client/ui-slots/`：slot registry 与 slot 组合
- `packages/client/modules/`：client module 加载与 graph
- `packages/client/ui-renderer/`：React 绑定与渲染
- `packages/test-support/client-runtime/`：仅测试用 runtime

所以：

- 这不是 alpha.2 新引入的回归，而是从 alpha.1 起就存在的存量适配债；
- 但如果要在 alpha.2 上真正启用 `adapter-dsh` 的浏览器 UI 半，必须先迁移这些引用。

### 2. adapter 的开发基线仍较旧

`adapter-dsh` 的 devDependencies 仍钉在：

```text
@deepseek-ai/dsh-agent         0.1.0-rc.7
@deepseek-ai/dsh-attachment    0.1.0-rc.6
@deepseek-ai/dsh-commands      0.1.0-rc.7
@deepseek-ai/dsh-llm           0.1.0-rc.7
@deepseek-ai/dsh-session       0.1.0-rc.7
@deepseek-ai/dsh-scope         0.1.0-rc.6
@deepseek-ai/dsh-tools         0.1.0-rc.6
@deepseek-ai/dsh-typert-protocol 0.1.0-rc.6
...
```

alpha.2 已到 `0.1.2-alpha.2`，且期间这些包的 API、导出、wire types 有实际变化。即使包名没有消失，也需要重新建立兼容基线并跑完整测试。

### 3. alpha 阶段契约仍在快速变化

预发布阶段 DSH 明确允许自由改名、重组、删包，且“不接受旧 on-disk 格式、不承诺兼容”。因此 dsh-std 不应把协议的可观测行为过多绑定到 DSH 某一版 alpha 的内部 API 上；标准层应继续以稳定、可机器验证的协议契约为准。

---

## 四、对 dsh-std 的定性与建议

### 定性

- **战略性利好**：DSH 继续朝“协议/契约优先、领域所有权分离、可组合 profile、可替换 provider”走，与 dsh-std 的核心叙事同向。
- **非直接利好**：alpha.2 没有接入 `@dsh-std`，也没有为 dsh-std 贡献新的公共协议。
- **当前落地仍有缺口**：`adapter-dsh` 需要先迁移到 DSH 新 client 架构，才能把标准组件真正跑在 alpha.2 上。

### 建议的后续动作

1. 在 dsh-std 本地开 dev 分支，以 alpha.2 为基线重新评估 adapter；
2. 迁移 `@deepseek-ai/dsh-client-runtime` 引用：
   - client context 改为 DSH 当前 client 结构（大概率是 `@deepseek-ai/cordis` 的 `Context` + `client/ui-slots` / `client/modules` 能力）；
   - 更新 `dsh.client.inject` 和 tsdown external 列表；
3. 用 alpha.2 的 `@deepseek-ai/dsh-*` 版本重跑：
   - `pnpm check`
   - adapter 的 browser half 测试
   - profile bundle 打包 / packed-install 验证；
4. 验证 session / event 映射，尤其是 `ignorable` 外部事件、session projection、plugin inventory 相关行为；
5. 若确需跟随 alpha.2，再考虑发布一个 `@dsh-std/adapter-dsh` 新版本；公共协议包本身不应因 DSH alpha 内部 API 变动而仓促改版。

---

## 参考文件索引

### DSH alpha.2 侧

- `.agents/notes/implemented/architecture/2026-08-05-profile-plugin-bundles.md`
- `.agents/notes/implemented/architecture/2026-07-26-job-registry-seam.md`
- `.agents/notes/implemented/architecture/2026-08-19-session-projection-mandatory-seam.md`
- `.agents/notes/implemented/architecture/2026-08-29-plugin-inventory-agent-preset-scopes.md`
- `.agents/notes/implemented/architecture/2026-08-30-retain-ignorable-external-session-events.md`
- `.agents/notes/implemented/process/2026-08-10-npm-release-sequences.md`
- `.agents/notes/implemented/process/2026-08-26-published-dependency-faces.md`
- `packages/bundle/`
- `packages/jobs/`
- `packages/session/session-persistence-sqlite/`
- `packages/host/plugin-inventory/`
- `packages/api/gateway/src/remote-error-codes.ts`
- `packages/typert/protocol/src/remote-error.ts`

### dsh-std 侧

- `packages/adapter-dsh/src/client.ts`
- `packages/adapter-dsh/package.json`
- `packages/adapter-dsh/tsdown.config.ts`
- `docs/proposals/adapter-dsh.zh.md`
- `docs/proposals/version-compatibility.zh.md`

---

> 本分析为本地只读审查，未对外发表任何评论；是否对外表达以及如何表达由风雪决定。
