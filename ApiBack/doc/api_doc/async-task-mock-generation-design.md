# 异步任务生成 Mock 数据 — 完整方案

## 1. 背景与目标

### 1.1 现状

创建接口信息（`CreateApiInfo`）时，若未填写 `mock_data` 且存在 `resp_schema`，当前实现会在**请求线程内同步**调用大模型 API 生成 Mock。模型响应慢或不稳定时，会**拉长 HTTP 响应时间**，影响体验与网关超时风险。

### 1.2 目标

- **HTTP 快速返回**：创建/更新接口的主流程尽快结束，不阻塞在大模型调用上。
- **后台生成 Mock**：由独立逻辑异步调用模型，将结果**写回** `api_info.mock_data`（及关联状态）。
- **可扩展**：异步能力以**通用任务表**承载，不仅服务于 Mock 生成，后续可扩展其他任务类型。
- **部署假设**：**基本单实例部署**（无需优先解决多机抢任务；仍保留认领与租约以应对进程异常与未来演进）。
- **幂等策略**：**允许**对同一业务合并任务——例如同一 `api_info` 在已有待处理任务时，不重复插入多条，或以「最新 schema」为准合并为一条可执行单元。

### 1.3 非目标（本期可不做）

- 引入外部消息队列（Redis Stream / RabbitMQ 等）。
- WebSocket 实时推送（可用轮询查询替代）。
- 复杂工作流编排引擎。

---

## 2. 总体架构

```
[HTTP] 创建/更新 api_info
    → 持久化 api_info（mock_data 可先为空或保留旧值）
    → 若需生成 Mock：写入/合并 通用任务表（pending）
    → 立即返回

[定时 Worker] 按固定间隔触发
    → 认领 pending（或租约过期的 running）任务
    → 按 task_type 分发到 Handler
    → Mock Handler：读 api_info 最新 resp_schema → 调模型 → 更新 mock_data
    → 更新任务状态 success / failed，必要时写重试字段
```

---

## 3. 通用任务表设计

### 3.1 设计原则

- 表名建议：`async_task`（或 `generic_async_task`，以项目命名规范为准）。
- 通过 **`task_type`** 区分业务（如 `GENERATE_API_MOCK`），避免为每种任务单独建表。
- 类型相关参数放入 **`payload`（JSON）**，避免任务表字段随业务爆炸增长。

### 3.2 建议字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `task_type` | VARCHAR(64) | 任务类型，如 `GENERATE_API_MOCK` |
| `payload` | JSON / TEXT | 类型相关参数，如 `{"api_info_id": 123}` |
| `status` | VARCHAR(32) | 见 3.3 状态机 |
| `idempotency_key` | VARCHAR(128) UNIQUE（可空） | 业务幂等键，如 `GENERATE_API_MOCK:api_info:123` |
| `attempts` | INT | 已尝试次数 |
| `max_attempts` | INT | 最大重试次数，默认如 3～5 |
| `next_retry_at` | DATETIME NULL | 退避重试的最早可执行时间 |
| `lease_owner` | VARCHAR(64) NULL | 认领方标识（单实例可用 hostname/随机实例 id） |
| `lease_expire_at` | DATETIME NULL | 租约到期时间；过期后允许被重新认领 |
| `last_error` | VARCHAR(512) NULL | 最后一次失败原因（截断，便于列表展示） |
| `created_at` / `updated_at` | DATETIME | 审计 |

可选：`started_at`、`finished_at` 用于统计耗时。

### 3.3 状态机建议

- `pending`：待认领执行。
- `running`：已被认领，执行中。
- `success`：成功结束。
- `failed`：失败结束（达到最大重试或不可重试错误）。
- `cancelled`（可选）：业务取消，不再执行。

不在此表内表达「接口是否已有 mock」的详情；**接口侧**可冗余轻量字段（见第 6 节）便于列表展示。

---

## 4. 认领（Claim）与租约（Lease）

### 4.1 认领

**含义**：把任务从「可被调度」变为「本次执行独占」，且更新为 **原子操作**，避免同一任务被并发执行两次。

**典型条件**：`WHERE id = ? AND status = 'pending'`（或满足租约回收条件，见下）执行 `UPDATE`，仅当影响行数为 1 时表示认领成功。

单实例下单 worker 时冲突概率低，但认领能防止：定时器重入、未来并发 worker、误起多进程。

### 4.2 租约

**含义**：处理权带**过期时间**。认领成功时写入 `lease_expire_at = now + N 分钟`（N 按大模型 P99 超时略放大）。

**作用**：

- Worker 崩溃或进程被强杀时，任务可能停在 `running`；**租约过期**后，调度逻辑可将该任务**回收**为 `pending`（或 `pending` + `attempts+1`），避免任务永久卡死。

**单实例简化**：若不做租约，至少应在**进程启动**时把遗留的 `running` 统一重置为 `pending`，否则仍有卡死风险。推荐仍保留租约字段，逻辑更自洽。

### 4.3 running 超时后的策略（需统一口径）

- **方案 A**：租约过期 → 改回 `pending`，`attempts` 不变或 +1，进入重试语义。
- **方案 B**：租约过期 → 直接记 `failed`（若业务不接受重复调模型）。

**建议**：对大模型类任务采用 **方案 A + max_attempts**，避免偶发网络抖动导致永久失败。

---

## 5. 任务创建与幂等合并

### 5.1 何时创建任务

与当前业务对齐（可随产品微调）：

- **新建接口**：`mock_data` 为空且 `resp_schema` 非空 → 需要异步生成。
- **更新 resp_schema**（若保留 `IsUpdateRespSchema` 语义）：需要重新生成 Mock → 创建或合并任务。

### 5.2 幂等键（idempotency_key）

示例：`GENERATE_API_MOCK:api_info:{api_info_id}`

- **插入前**：查询是否存在 `status IN ('pending','running')` 且相同 `idempotency_key` 的任务。
- **若存在**：
  - **合并策略（已确认允许）**：不新建行；可更新 `payload` 中版本号或依赖「执行时再从 DB 读最新 resp_schema」而不更新 payload（推荐执行时**始终以 DB 为准**读 schema，payload 仅带 `api_info_id`）。
- **若不存在**：插入新任务，`status=pending`。

### 5.3 事务边界

**建议**：在同一数据库事务中完成：

1. 插入或更新 `api_info`；
2. 插入或合并 `async_task`（pending）。

避免「接口已落库但任务未创建」的长期不一致。若任务插入失败，应整体回滚或明确补偿策略（优先同事务）。

---

## 6. 接口表（api_info）配合字段（建议）

为减少列表页 join 任务表，可在 `api_info` 上增加轻量冗余（名称仅供参考）：

- `mock_generation_status`：`pending | running | success | failed | skipped`
- `mock_generation_error`：截断错误信息（可选）
- `mock_generation_updated_at`：最后一次状态变更时间（可选）

**约定**：

- 创建接口成功且需异步生成时：将 `mock_generation_status` 置为 `pending`（或 `running` 若与任务严格同步，一般 `pending` 即可）。
- Worker 认领任务开始调模型前/后：可更新为 `running`（若希望前端更细，需与任务状态更新同事务或接受短暂延迟）。
- 任务成功：写 `mock_data`，`mock_generation_status=success`，清空或忽略 `mock_generation_error`。
- 任务失败：`mock_generation_status=failed`，写入截断错误。

若暂不增加列，前端也可通过**任务 id + 轮询任务接口**或**仅轮询详情**获取 mock 是否已生成（以 `mock_data` 非空判断），但可观测性较弱，**推荐增加状态字段**。

---

## 7. Worker / 定时调度

### 7.1 触发方式

- 使用 Go 定时器（如 `time.Ticker`）或 cron 库，间隔建议 **5～15 秒** 起步（可按队列深度再调）。
- 每次迭代：**批量**拉取待处理任务（带 `LIMIT`），防止单次拖垮模型 QPS。

### 7.2 拉取条件（示例）

- `status = 'pending' AND (next_retry_at IS NULL OR next_retry_at <= NOW())`
- **或** `status = 'running' AND lease_expire_at < NOW()`（租约回收）

### 7.3 Handler 注册

按 `task_type` 分发到不同 Handler，避免单一巨型 `switch`：

- `GENERATE_API_MOCK` → 读取 `api_info_id`，校验记录存在且未删除 → 读最新 `resp_schema` → 调用现有 `GPTService.Generate` → 更新 `api_info.mock_data` 与状态字段 → 更新任务为 `success` / `failed` / 设置 `next_retry_at`。

### 7.4 重试与错误分类

- **可重试**：超时、5xx、429 等 → `attempts++`，若 `attempts < max_attempts`，设 `next_retry_at`（指数退避），任务回到 `pending` 或保持 `pending` 语义；**释放租约**，勿长期占 `running`。
- **不可重试**：401、参数错误、resp_schema 为空 → `status=failed`，`last_error` 记录摘要。

---

## 8. API / 前端契约（建议）

- **创建接口响应**：返回 `api_info.id`；若创建了异步任务，可返回 `task_id` 或直接在 `api_info` 中带 `mock_generation_status`。
- **前端**：详情/列表展示「Mock 生成中」；可定时刷新详情直到 `success` 或 `failed`。
- **失败体验**（可选）：提供管理端或接口「重新生成 Mock」= 插入新任务或重置失败任务为 `pending`（注意幂等键与合并策略）。

---

## 9. 可观测性与运维

- 日志：任务 id、`api_info_id`、`task_type`、耗时、`attempts`、错误摘要。
- 指标（可选）：待处理队列长度、失败率、平均等待时间。
- **last_error** 与 **mock_generation_error** 需**截断**（如 512 字符），避免大文本入库。

---

## 10. 迁移与回滚

1. 新增 `async_task` 表及索引（`status + next_retry_at`、`idempotency_key` 唯一索引）。
2. 可选：为 `api_info` 增加 Mock 状态相关列；历史数据可统一为 `skipped` 或 `success`（若已有 `mock_data`）。
3. 应用侧：**移除** `CreateApiInfo` 内同步 `gptService.Generate`，改为写任务表。
4. 启动 Worker 与主 HTTP 服务（可同进程不同 goroutine，简化运维）。

回滚：恢复同步调用代码路径，并停止 worker；已 `pending` 任务可脚本批量取消或执行完毕后再切换。

---

## 11. 方案小结

| 项 | 结论 |
|----|------|
| 任务模型 | 通用表 + `task_type` + JSON `payload` |
| 调度 | 定时批量拉取 + **认领** + **租约**（单实例仍建议保留） |
| 幂等 | `idempotency_key`，待处理任务合并，执行时以 DB 最新 schema 为准 |
| 一致性 | `api_info` 与任务 **同事务** 提交 |
| 用户体验 | `api_info` 冗余 `mock_generation_status` + 前端轮询 |

本文档作为实现与评审基线；字段命名、间隔秒数、`max_attempts`、租约时长可在开发前通过配置固化。

---

## 12. 实现落地说明（与代码对齐）

- **表名**：`async_task`；**接口表字段**：`mock_generation_status`、`mock_generation_error`、`mock_generation_updated_at`（另含既有 `mock_data`）。
- **配置**：`config/application.yml` → `async_worker`（`interval_seconds`、`lease_minutes`、`max_attempts`、`batch_size`），启动时经 `NormalizeAsyncWorker` 填默认值。
- **DDL**：`doc/sql/init.sql` 已更新；已有库请执行 `doc/sql/migration_async_task.sql`（若某列已存在需手动跳过对应 `ALTER`）。
- **Worker**：与 HTTP 同进程，`main` 中 `go container.AsyncWorker.Run(context.Background())`。
- **创建接口响应 JSON**：`id`、`mock_generation_status`（`pending` / `skipped` 等）；列表/详情接口返回中已带 Mock 生成相关字段。
- **任务类型常量**：`internal/infrastructure/model/async_task_do.go` 中 `TaskTypeGenerateAPIMock` 等。
