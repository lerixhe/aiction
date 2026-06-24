# AIction

> 选中文本 → 触发 AI → 继续对话

轻量级桌面应用程序，为选中内容提供 AI 辅助。基于 Tauri v2、Rust 和 React 构建。

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green)](package.json)

**[English](./README.md)**

## 功能特性

**内联 AI 工具栏**

在任意位置选中文本，工具栏随即出现，提供可配置的 AI 动作。

**浮动聊天面板**

在可拖拽、可调整大小的面板中继续对话，支持流式响应。

**自定义动作**

创建自己的提示词模板，使用 `{text}` 占位符。内置动作：

| 动作 | 模板 |
|------|------|
| 解释 | `帮我解释选中内容「{text}」` |
| 翻译 | `请将以下内容翻译为简体中文：\n{text}` |

**多模型支持**

OpenAI、Anthropic Claude、Google Gemini、DeepSeek、OpenRouter，或任何 OpenAI 兼容 API。

**其他功能**

- 思维链展示 — 查看模型推理过程（DeepSeek `reasoning_content` 等）
- 深色模式 — 自动 / 浅色 / 深色主题
- 系统托盘 — 最小化到托盘，快速访问
- 全局快捷键 — 使用键盘快捷键触发动作
- 剪贴板监控 — 自动检测和处理剪贴板内容
- 文件操作 — 读取、写入和处理文件
- Shell 命令 — 在 AI 辅助下执行系统命令

## 安装

**下载**

从 [Releases](https://github.com/lerixhe/aiction/releases) 页面下载适合您平台的最新版本。

**从源码构建**

```bash
git clone https://github.com/lerixhe/aiction.git
cd aiction
pnpm install
pnpm build:tauri
```

## 快速上手

1. 启动应用程序
2. 点击设置图标配置 AI 提供商
3. 添加模型服务（API URL + Key + Model）
4. 点击"测试连接"
5. 在任意位置选中文本 → 点击工具栏 → 选择动作

## 配置

### 模型服务

| 字段 | 说明 | 示例 |
|------|------|------|
| API Base URL | OpenAI 兼容端点 | `https://api.openai.com/v1` |
| API Key | API 密钥 | `sk-...` |
| Model | 模型标识符 | `gpt-4o-mini` |

### 模型参数

| 参数 | 默认值 | 范围 |
|------|--------|------|
| Max Tokens | 1024 | 1 - 32768 |
| Temperature | 0.3 | 0 - 2 |
| Top P | 0.9 | 0 - 1 |
| Presence Penalty | 0 | -2 - 2 |
| Frequency Penalty | 0 | -2 - 2 |

## 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Tauri v2 应用程序                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Rust 后端                              │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌───────────────────┐ │  │
│  │  │ AI 客户端   │ │ 动作引擎     │ │ 系统集成          │ │  │
│  │  │ (Vercel SDK)│ │              │ │                   │ │  │
│  │  └─────────────┘ └──────────────┘ └───────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │ Tauri IPC (invoke/events)       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    React 前端                             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │  │
│  │  │ 动作     │ │ 聊天     │ │ 设置     │ │ 文件       │  │  │
│  │  │ 工具栏   │ │ 面板     │ │          │ │ 拖放       │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

详细架构文档：[docs/WIKI.md](docs/WIKI.md)

## 技术栈

- [Tauri v2](https://tauri.app/) — 桌面框架
- Rust — 后端语言
- React 19 + TypeScript
- Vite — 构建工具
- TailwindCSS v4 — 样式框架
- [Vercel AI SDK](https://sdk.vercel.ai/) — 流式 AI 调用

## 开发

### 命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm dev:tauri` | 启动 Tauri 开发模式 |
| `pnpm build` | 仅构建前端 |
| `pnpm build:tauri` | 构建完整应用程序 |
| `pnpm typecheck` | TypeScript 类型检查 |

### 路径别名

`~/*` 和 `@/*` 均映射到 `src/*`：

```typescript
import { useUiTheme } from "@/shared/ui/theme"
```

### 修改后验证

1. 运行 `pnpm typecheck` 和 `pnpm build`
2. 运行 `pnpm dev:tauri` 在开发模式下测试
3. 运行 `pnpm build:tauri` 构建生产版本

## 贡献

1. Fork 本仓库
2. 创建分支：`git checkout -b feature/xxx`
3. 进行修改
4. 运行 `pnpm typecheck` 和 `pnpm build`
5. 测试应用程序
6. 提交 Pull Request

## 许可证

[GPL-3.0](LICENSE)
