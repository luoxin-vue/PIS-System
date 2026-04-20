# PIS-System

进销存系统 — 前端（Vite + React + TypeScript + Ant Design）。

## 开发

```bash
npm install
npm run dev
```

默认开发服务器会代理 `/api` 到 `http://localhost:3000`（见 `vite.config.ts`）。请先启动后端，或自行修改代理目标。

## 构建

```bash
npm run build
```

产物在 `dist/`。

## 环境说明

- 接口基路径当前为 `/api`（见 `src/api/client.ts`），依赖开发环境代理或生产环境同源/网关配置。
