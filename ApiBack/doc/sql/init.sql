create table project (
    id BIGINT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    name VARCHAR(256) NOT NULL COMMENT '项目名称',
    project_name_id VARCHAR(256) NOT NULL COMMENT '项目名称ID',
    description TEXT COMMENT '项目描述',
    ctime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    mtime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_del TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    editor VARCHAR(256) COMMENT '编辑者',
    creator VARCHAR(256) COMMENT '创建者'
);

-- 接口信息表
create table api_info (
    id BIGINT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    project_id BIGINT NOT NULL COMMENT '项目ID',
    path VARCHAR(256) NOT NULL COMMENT '接口路径',
    method VARCHAR(10) NOT NULL COMMENT '接口方法',
    api_name_id VARCHAR(256) NOT NULL COMMENT '接口名称ID',
    title VARCHAR(256) NOT NULL COMMENT '接口标题',
    req_schema JSON COMMENT '请求参数Schema',
    resp_schema JSON COMMENT '响应参数Schema',
    mock_data TEXT COMMENT 'Mock 响应数据',
    mock_generation_status VARCHAR(32) NOT NULL DEFAULT 'skipped' COMMENT 'Mock 异步生成状态: pending/running/success/failed/skipped',
    mock_generation_error VARCHAR(512) NULL COMMENT 'Mock 生成失败摘要',
    mock_generation_updated_at DATETIME NULL COMMENT 'Mock 生成状态最后更新时间',
    version VARCHAR(256) NOT NULL COMMENT '接口版本',
    description TEXT COMMENT '接口描述',
    ctime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    mtime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_del TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    editor VARCHAR(256) COMMENT '编辑者',
    creator VARCHAR(256) COMMENT '创建者'
);

CREATE TABLE async_task (
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