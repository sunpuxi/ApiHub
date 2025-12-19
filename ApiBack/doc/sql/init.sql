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
    version VARCHAR(256) NOT NULL COMMENT '接口版本',
    description TEXT COMMENT '接口描述',
    ctime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    mtime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_del TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    editor VARCHAR(256) COMMENT '编辑者',
    creator VARCHAR(256) COMMENT '创建者'
);