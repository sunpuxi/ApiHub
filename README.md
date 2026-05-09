# ApiHub - API 接口文档管理平台

## 项目简介

ApiHub 是一个轻量化的 API 接口文档管理平台，支持项目管理、接口定义管理、AI 驱动的 Mock 数据生成，以及通过 **MCP（Model Context Protocol）** 协议与 AI Code Agent 集成。

### 核心功能

- **项目管理** — 创建 / 编辑 / 查询项目
- **接口管理** — 在每个项目下定义 API 接口，支持请求 / 响应 JSON Schema
- **AI Mock 数据生成** — 对接 DeepSeek API，根据接口 `resp_schema` 自动生成 Mock 数据
- **异步任务系统** — Mock 生成通过后台 Worker 异步执行，避免阻塞
- **MCP 集成** — 内嵌 MCP SSE Server，Code Agent（Cursor / Claude Code 等）可直接查询和创建接口

### 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + Ant Design 6 + TypeScript + Vite 7 |
| 后端 | Go 1.25 + Gin + GORM + MySQL + DDD 架构 |
| AI | DeepSeek API（OpenAI 兼容接口） |
| MCP | `github.com/modelcontextprotocol/go-sdk` v1.5.0（SSE Transport） |

---

## 目录结构

```
ApiHub/
├── ApiBack/                   # Go 后端
│   ├── cmd/                   # 入口目录
│   ├── common/                # 公共模块（配置、数据库初始化）
│   │   ├── config/            # 配置加载
│   │   └── db.go              # 数据库初始化
│   ├── config/
│   │   └── application.yml    # 配置文件（含 MySQL / DeepSeek Key）
│   ├── internal/
│   │   ├── application/       # 应用服务层（用例编排）
│   │   │   └── service/       #   ├── mcp_app_service.go  ← MCP Server 工具定义
│   │   ├── domian/            # 领域层（实体、服务、仓库接口）
│   │   ├── infrastructure/    # 基础设施层（数据库实现、外部客户端、Worker）
│   │   └── interface/         # 接口层（Gin Handler、DTO、路由注册）
│   │       ├── api/           #   ├── mcp_handler.go    ← MCP SSE Handler
│   │       └── init/          #   ├── container.go      ← 依赖注入
│   │                          #   └── route.go          ← 路由注册
│   ├── doc/sql/               # 数据库初始化、迁移脚本
│   ├── go.mod / go.sum
│   └── main.go                # 后端入口
│
├── ApiFront/                  # React 前端
│   ├── src/
│   │   ├── components/        # 组件
│   │   ├── services/          # API 调用封装
│   │   ├── types/             # TypeScript 类型定义
│   │   ├── utils/             # 工具函数
│   │   └── App.tsx            # 应用入口
│   ├── package.json
│   └── vite.config.ts
│
└── .gitignore
```

---

## 本地部署

### 前置条件

- Go 1.25+
- Node.js 20+
- MySQL 8.0+
- DeepSeek API Key（可选，如果需要 Mock 生成功能）

### 1. 数据库初始化

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS api_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE api_hub;

-- 执行初始化脚本（建表）
SOURCE ApiBack/doc/sql/init.sql;

-- 如从旧版升级，执行迁移脚本
SOURCE ApiBack/doc/sql/migration_async_task.sql;
```

### 2. 后端配置

复制配置模板并修改：

```bash
cp ApiBack/config/application.yml ApiBack/config/application.yml
```

编辑 `ApiBack/config/application.yml`：

```yaml
mysql:
  host: localhost
  port: 3306
  username: root
  password: your_password
  database: api_hub

deepseek_key: "your_deepseek_api_key_here"   # Mock 生成需要，留空则跳过

async_worker:
  interval_seconds: 10
  lease_minutes: 8
  max_attempts: 5
  batch_size: 5
```

> 注意：`application.yml` 已加入 `.gitignore`，不会提交到 Git。

### 3. 启动后端

```bash
cd ApiBack
go mod tidy
go run main.go
```

服务启动后访问 `http://localhost:8080/`，看到 `{"message":"ApiHub API Service"}` 即表示启动成功。

### 4. 启动前端

```bash
cd ApiFront
npm install
npm run dev
```

前端默认运行在 `http://localhost:3001`，Vite 已配置代理转发 `/api` 请求到后端 `:8080`。

---

## REST API 接口

所有 API 以 `http://localhost:8080/api/v1` 为基路径：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/projects/createProject` | 创建项目 |
| GET | `/projects/query` | 查询项目列表 |
| POST | `/apis/createApi` | 创建 / 更新接口 |
| GET | `/apis/query` | 查询接口列表（分页、条件过滤） |

---

## MCP 配置

ApiHub 内嵌了 MCP Server，采用 SSE Transport，运行在 **`http://localhost:8080/mcp`**。

### 注册的 MCP 工具

| 工具名 | 说明 |
|--------|------|
| `query_apis` | 查询接口列表（支持按项目、路径、方法过滤，分页） |
| `query_project_by_name` | 根据项目名称查询项目信息 |
| `upsert_api_info` | 创建 / 更新接口信息 |

### Cursor 配置

在项目根目录创建 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "apihub": {
      "type": "url",
      "url": "http://localhost:8080/mcp"
    }
  }
}
```

### Claude Code 配置

```bash
claude mcp add apihub --type url --url http://localhost:8080/mcp
```

### 云端部署

部署到云服务器后，只需将 `url` 改为云端地址：

```json
{
  "mcpServers": {
    "apihub": {
      "type": "url",
      "url": "https://api.example.com/mcp"
    }
  }
}
```

**无需本地额外进程**，所有 Code Agent 只需一个 URL 配置即可接入。

---

## api-sync-to-hub Skill

项目内置了一个 CodeBuddy Skill，可将 Go 代码中的 API Handler 自动同步到 ApiHub 平台。

**使用方式**：在打开的 Go Handler 文件中，调用 Skill：

```
使用 api-sync-to-hub skill 将当前接口同步到 ApiHub
```

Skill 会自动：
1. 读取 Handler 代码和 DTO 结构体
2. 推断项目名称并调用 MCP 查询 `project_name_id`
3. 从 Go struct 生成 JSON Schema
4. 提取路由 Path 和 HTTP Method
5. 调用 MCP `upsert_api_info` 同步到平台

---

## 开发说明

### 后端架构

采用 **DDD（领域驱动设计）** 四层架构：

```
Interface（接口层）→ Application（应用层）→ Domain（领域层）→ Infrastructure（基础设施层）
```

### Mock 数据生成流程

```
用户保存接口（含 resp_schema）
  → 创建 AsyncTask（状态 pending）
  → Worker 轮询到任务
  → 调用 DeepSeek API 生成 Mock 数据
  → 更新 api_info 表（状态 success / failed）
  → 前端展示 Mock 结果
```

---

## License

MIT
