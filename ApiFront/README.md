# ApiHub 前端项目

基于 React + TypeScript + Vite + Ant Design 构建的 API 接口文档管理平台前端项目。

## 功能特性

- ✅ 创建项目
- ✅ 创建接口

## 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型系统
- **Vite** - 构建工具
- **Ant Design** - UI 组件库
- **Axios** - HTTP 客户端

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

前端服务将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

## API 配置

后端 API 地址配置在 `src/services/api.ts` 中，默认为 `http://localhost:8080/api/v1`。

如需修改，可编辑 `vite.config.ts` 中的代理配置。

## 项目结构

```
src/
  ├── components/        # 组件
  │   ├── CreateProject.tsx    # 创建项目组件
  │   └── CreateApi.tsx        # 创建接口组件
  ├── services/          # API 服务
  │   └── api.ts        # API 客户端
  ├── types/            # 类型定义
  │   └── api.ts        # API 类型
  ├── App.tsx           # 主应用组件
  └── main.tsx          # 入口文件
```

## 注意事项

1. 确保后端服务已启动（默认端口 8080）
2. 创建接口时需要先有项目，当前使用模拟数据，后续需要对接后端获取项目列表
