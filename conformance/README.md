# Conformance & Verification

验证是对公开 contract、schema、registry 和 fixtures 的检查，不是“跑过参考实现”。当前 runner：`node conformance/tests/run.js`，入口：`npm test`。

## Evidence level

```text
Declared -> Parsed -> Negotiated -> Tested -> Observed -> Attested
```

- `Declared`：manifest/Host Descriptor 自己声称；
- `Parsed`：通过对应 schema；
- `Negotiated`：绑定指定 Host Descriptor 后得到机器可读 decision；
- `Tested`：通过公开 fixtures 和测试套件；
- `Observed`：在指定 runtime 中被记录；
- `Attested`：有独立验证主体的可核验签署证据。

> 社区 RFC v0.15 的 RFC 0004 草案使用另一组术语（declared / resolved / decided / observed / tested / attested）。两者均为 6 级，中间三项命名不同；本文保留本库 ladder，待 RFC 0004 定案后对齐，并已在社区讨论中提出该差异。

任何 claim MUST 绑定 `schemas/conformance-claim.schema.json` 的等价 schema、Community spec version、Host Descriptor digest、artifact digest、suite version、result、测试时间和 evidence level。claim 过期或 revoked 后不得继续展示为有效。

## 绝对禁止

不得把任何 evidence level 转换成“安全插件”“官方认证”“无漏洞”或“完全兼容所有 dsh”。trusted-in-process 模式下，capability/permission 不是技术安全边界。

## 最小测试

**当前 runner（`conformance/tests/run.js`，suite `community-v0.15`）已覆盖：**

- Manifest：缺字段、类型错误、未注册契约坐标（group/kind）、非法 namespace、重复 contribution ID、禁止 service 声明（`requires.services` 与 `provides`）、optional 引用缺 fallback（含未注册版本分支）、client/worker facet 拒绝、未注册 facet apiVersion、重复坐标引用（required+optional 并存）；
- 坐标解析：group+kind 已知但 apiVersion 未注册 → 合法 manifest、协商返回 `unknown`；group/kind 未知 → `INVALID_MANIFEST`；subscription 指向 capability 而非 event → `INVALID_MANIFEST`；
- Negotiation：`compatible`、`waiting_authorization`、授权后通过、`rejected`（required 契约缺失）、`compatible_degraded`（optional 缺失 + 已声明 fallback）、`unknown`（契约版本未注册）、复合优先级（未注册版本 + required 缺失 → `unknown` 胜出）、facet 版本不匹配 → `rejected`（`FACET_API_VERSION_UNAVAILABLE`）；
- Contract profile：registry hash 漂移检查 + SPEC-WRITING-RULES §5 十点完整性检查 + profile/registry 坐标与权限一致性；
- Event envelope：合法消息、未知 privacyClass 拒绝、ContentBlock payload 拒绝（缺字段 / text+image 字段混合）；
- Ledger / claim / Host Descriptor：合法 fixture 通过；Host Descriptor 坐标与 schemaHash 必须与 registry 一致、权限必须已注册、坐标不得重复（fail closed）。

**已知局限（`unknown` 触发条件 (b)）**：runner 与 registry 静态绑定在同一发布物，"registry 版本高于协商器支持版本"分支无机器路径；可插拔 registry 版本的实现必须自行实现该分支（C-030）。

**目标清单（当前 runner 未覆盖，`requirements-v0.15.json` 中标记 `evidence: "review"`）：**

- Lifecycle：正常/重复 activation、异常、deactivate、cleanup retry（C-050）；
- Ledger 全操作序列：create、bind、replace、release、cleanup-failed 的组合行为；
- Trust disclosure 审查（C-070，人工项）；
- Remote：local/remote runtime、TUI/Web presentation、attach/detach、invocation snapshot；这些属于 TUI profile 的额外测试。

`requirements-v0.15.json` 中每条的 `evidence` 字段区分 `automated`（runner 可执行证明）与 `review`（人工审查或可执行套件待建）；只有 `automated` 条目能作为机器门禁引用。合法/非法输入见 `fixtures/`。失败必须返回稳定 reasonCode，并在市场/Host 展示"不可兼容、待授权、降级或未知"，不能只显示泛化的安装失败。
