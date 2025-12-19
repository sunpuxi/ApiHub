**项目介绍**
1、轻量化的Api接口文档管理平台
2、没有登录、注册、复杂的权限校验逻辑
3、核心功能是根据配置的接口的返回数据类型生成对应的Mock数据

**项目架构**
1、后端项目基于Gin、MySQL、Gorm搭建，项目整体架构采用DDD架构模式。
2、前端项目基于Vue搭建

**数据库表结构设计**
1、系统中的实体主要是项目和接口。
2、项目实体和接口实体的关系为一比多。

```sql
create table project (
    id BIGINT AUTO_INCREMENT NOT NULL PRIMARY,
    name VARCHAR(256) NOT NULL COMMENT '项目名称',
    description TEXT COMMENT '项目描述',
    ctime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    mtime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_del TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    editor VARCHAR(256) COMMENT '编辑者',
    creator VARCHAR(256) COMMENT '创建者',
);

-- 接口信息表
create table api_info (
    id BIGINT AUTO_INCREMENT NOT NULL PRIMARY,
    project_id BIGINT NOT NULL COMMENT '项目ID',
    path VARCHAR(256) NOT NULL COMMENT '接口路径',
    method VARCHAR(10) NOT NULL COMMENT '接口方法',
    title VARCHAR(256) NOT NULL COMMENT '接口标题',
    req_schema JSON COMMENT '请求参数Schema',
    resp_schema JSON COMMENT '响应参数Schema',
    version VARCHAR(256) NOT NULL COMMENT '接口版本',
    description TEXT COMMENT '接口描述',
    ctime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    mtime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_del TINYINT(1) DEFAULT 0 COMMENT '是否删除',
    editor VARCHAR(256) COMMENT '编辑者',
    creator VARCHAR(256) COMMENT '创建者',
);
```

**功能设计**
1、轻量化使用：创建项目、在项目下创建接口即可。
2、Mock 数据的实现方式：通过对接智谱Ai模型。
3、实现简单的接口测试功能：服务接收到调用方的请求时，通过访问的接口信息获取对应的请求参数的JSON Schema信息，判断当前的调用方的请求是否合格，合格则返回Mock数据，不合格则返回错误提示信息。