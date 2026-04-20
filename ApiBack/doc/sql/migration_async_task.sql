-- 已有库增量迁移：异步任务 + api_info Mock 状态列（若列已存在请跳过对应语句）

ALTER TABLE api_info
    ADD COLUMN mock_data TEXT NULL COMMENT 'Mock 响应数据' AFTER resp_schema;

ALTER TABLE api_info
    ADD COLUMN mock_generation_status VARCHAR(32) NOT NULL DEFAULT 'skipped' COMMENT 'Mock 异步生成状态' AFTER mock_data;

ALTER TABLE api_info
    ADD COLUMN mock_generation_error VARCHAR(512) NULL COMMENT 'Mock 生成失败摘要' AFTER mock_generation_status;

ALTER TABLE api_info
    ADD COLUMN mock_generation_updated_at DATETIME NULL COMMENT 'Mock 生成状态最后更新时间' AFTER mock_generation_error;

CREATE TABLE IF NOT EXISTS async_task (
    id BIGINT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    task_type VARCHAR(64) NOT NULL COMMENT '任务类型',
    payload JSON NOT NULL COMMENT '任务参数 JSON',
    status VARCHAR(32) NOT NULL COMMENT 'pending/running/success/failed/cancelled',
    idempotency_key VARCHAR(128) NOT NULL COMMENT '业务幂等键',
    attempts INT NOT NULL DEFAULT 0 COMMENT '已执行次数',
    max_attempts INT NOT NULL DEFAULT 5 COMMENT '最大重试次数',
    next_retry_at DATETIME NULL COMMENT '最早可再次重试时间',
    lease_owner VARCHAR(64) NULL COMMENT '租约持有者',
    lease_expire_at DATETIME NULL COMMENT '租约过期时间',
    last_error VARCHAR(512) NULL COMMENT '最后一次错误摘要',
    started_at DATETIME NULL COMMENT '本次开始执行时间',
    finished_at DATETIME NULL COMMENT '结束时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_async_task_status_retry (status, next_retry_at),
    INDEX idx_async_task_lease (status, lease_expire_at)
);
