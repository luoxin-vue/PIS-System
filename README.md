# PIS-System

进销存系统 — 前端（Vite + React + TypeScript + Ant Design）。

## 开发

```bash
nvm use
npm install
npm run dev
```

默认开发服务器会代理 `/api` 到 `http://localhost:3000`（见 `vite.config.ts`）。请先启动后端，或自行修改代理目标。

## 协作规范

- Node.js：`22.13.0`（见 `.nvmrc`）
- npm：`10.x`（见 `package.json -> engines`）
- 提交规范：Conventional Commits（`commitlint`）
- 代码格式化：Prettier（`lint-staged` 在 pre-commit 自动执行）

常用命令：

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

如果克隆后没有启用 hooks，可手动执行：

```bash
npm run prepare
```

## 构建

```bash
npm run build
```

产物在 `dist/`。

## 环境说明

- 接口基路径当前为 `/api`（见 `src/api/client.ts`），依赖开发环境代理或生产环境同源/网关配置。
