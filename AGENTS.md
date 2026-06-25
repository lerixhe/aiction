# AGENTS.md

## Project Summary
Desktop application built with Tauri v2 + Rust + React + TypeScript. Users select text anywhere, trigger AI actions from an inline toolbar, and continue conversation in a floating chat panel. AI backend uses an OpenAI-compatible `/chat/completions` endpoint via Vercel AI SDK.

## Quick Facts
- **Framework**: Tauri v2 (Rust backend + React frontend)
- **Build tool**: Vite + Tauri CLI
- **Styling**: TailwindCSS v4
- **TypeScript path alias**: `~/*` and `@/*` map to `src/*` (tsconfig `paths`).
- **AI SDK**: Vercel AI SDK (`ai` package) for streaming/text generation.

## Commands

### 开发命令
- `pnpm dev`: 只启动 Vite 开发服务器（纯前端，无法调用 Tauri API）
- `pnpm dev:tauri`: 启动完整 Tauri 开发模式（前端 + 后端，推荐）
- `pnpm typecheck`: TypeScript 类型检查
- `pnpm build`: 构建前端
- `pnpm build:tauri`: 构建完整应用

### Rust 命令
- `cd src-tauri && cargo check`: 快速检查 Rust 代码（只检查不编译）
- `cd src-tauri && cargo build`: 编译 Rust 代码

## 开发模式

### 模式 A：完整开发（推荐）
```bash
pnpm dev:tauri
```
- ✅ 可以调用所有 Tauri API
- ✅ 前端修改即时生效（Vite HMR）
- ✅ Rust 修改后自动重新编译并重启窗口

### 模式 B：纯前端开发
```bash
pnpm dev
# 在浏览器打开 http://localhost:5173
```
- ✅ 启动快（<1秒）
- ❌ 无法调用 Tauri API

## 项目结构

```
aiction/
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   ├── main.rs               # Tauri 入口点
│   │   ├── lib.rs                # 主库文件（注册命令、插件、状态）
│   │   ├── error.rs              # 自定义错误类型
│   │   ├── state.rs              # 应用状态定义
│   │   └── commands/             # Tauri 命令
│   │       ├── mod.rs            # 模块声明
│   │       ├── basic.rs          # 基础命令
│   │       ├── ai.rs             # AI API 集成
│   │       ├── action.rs         # 动作执行
│   │       ├── clipboard.rs      # 剪贴板操作
│   │       ├── fs.rs             # 文件系统操作
│   │       └── shell.rs          # Shell 命令执行
│   ├── capabilities/             # 权限配置
│   │   └── default.json          # 默认权限
│   ├── Cargo.toml                # Rust 依赖
│   └── tauri.conf.json           # Tauri 配置
│
├── src/
│   ├── entrypoints/
│   │   ├── index.html            # HTML 入口
│   │   ├── main.tsx              # React 入口
│   │   ├── App.tsx               # 主应用组件
│   │   └── styles.css            # 全局样式
│   ├── components/               # React 组件
│   └── shared/                   # 共享代码
│       └── ui/
│           ├── Icon.tsx          # 图标组件
│           └── bundled-icons.ts  # 打包的图标数据
│
├── vite.config.ts                # Vite 配置
├── postcss.config.js             # PostCSS 配置
├── tailwind.config.js            # TailwindCSS 配置
└── package.json                  # Node.js 依赖
```

## 添加新的 Tauri 命令

### 1. 在 Rust 中定义命令
```rust
// src-tauri/src/commands/xxx.rs
use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::State;

use crate::error::AppError;
use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct MyRequest {
    pub param: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MyResponse {
    pub result: String,
    pub success: bool,
}

#[command]
pub async fn my_command(
    request: MyRequest,
    state: State<'_, AppState>,
) -> Result<MyResponse, AppError> {
    // 输入验证
    if request.param.is_empty() {
        return Err(AppError::Validation("param is required".to_string()));
    }

    // 使用状态
    let config = state.ai_config.lock().unwrap();

    // 业务逻辑
    log::info!("Processing: {}", request.param);

    Ok(MyResponse {
        result: format!("Processed: {}", request.param),
        success: true,
    })
}
```

### 2. 在 lib.rs 中注册命令
```rust
// src-tauri/src/lib.rs
.invoke_handler(tauri::generate_handler![
    // ... 其他命令
    commands::xxx::my_command,
])
```

### 3. 在前端调用命令
```typescript
import { invoke } from '@tauri-apps/api/core';

interface MyResponse {
  result: string;
  success: boolean;
}

try {
  const response = await invoke<MyResponse>('my_command', {
    request: { param: 'hello' }
  });
  console.log(response.result);
} catch (error) {
  console.error('Command failed:', error);
}
```

## 调试技巧

### Rust 日志
```rust
log::info!("信息: {:?}", data);
log::error!("错误: {:?}", error);
```
日志会在 `pnpm dev:tauri` 的终端输出。

### 前端控制台
在 Tauri 窗口中按 `Cmd + Option + I` (macOS) 或 `Ctrl + Shift + I` 打开 DevTools。

### 快速验证 Rust
```bash
cd src-tauri && cargo check
```

## Workflow Rules
- **代码修改后必须验证**：每次修改代码后，必须主动运行 `pnpm typecheck` 和 `pnpm build`，确保类型正确且构建成功。
- **Rust 修改后用 cargo check**：快速验证 Rust 代码是否编译通过。
- **添加新命令后必须注册**：在 `lib.rs` 的 `invoke_handler` 中注册新命令。

---

## Tauri 开发指导原则

> **重要**：以下原则来自 `desktop-app` 和 `tauri` skills，必须严格遵守。

### 安全配置

#### CSP 策略 (`tauri.conf.json`)
```json
"security": {
  "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' asset: https://asset.localhost; connect-src 'self' https://api.openai.com"
}
```
- **禁止** `csp: null`（当前已修复）
- **必须** 限制 `connect-src` 来源

#### 权限配置 (`capabilities/default.json`)
- **必须** 为每个插件配置最小必要权限
- **必须** 使用 `fs:scope` 限制文件访问范围
- **禁止** 使用 `allow-all`

### 状态管理

#### 使用 `tauri::State`
```rust
// src-tauri/src/state.rs
pub struct AppState {
    pub ai_config: Mutex<AiConfig>,
    pub clipboard_monitor_active: Mutex<bool>,
}

// 在命令中使用
#[tauri::command]
pub fn my_command(state: State<AppState>) -> Result<(), AppError> {
    let config = state.ai_config.lock().unwrap();
    // ...
}
```
- **必须** 使用 `Mutex` 保护共享状态
- **必须** 在 `lib.rs` 中通过 `.manage(AppState::new())` 注册

### 错误处理

#### 使用自定义错误类型
```rust
// src-tauri/src/error.rs
#[derive(Debug, Error)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("AI API error: {message}")]
    AiApi { code: String, message: String },
    // ...
}
```
- **禁止** 命令返回 `Result<T, String>`
- **必须** 使用 `AppError` 作为错误类型
- **必须** 为错误实现 `Serialize`（Tauri 要求）

### 代码结构

#### 命令模块化
```
src-tauri/src/
├── commands/
│   ├── mod.rs          # 模块声明
│   ├── basic.rs        # 基础命令（greet, get_version 等）
│   ├── ai.rs           # AI 相关命令
│   ├── action.rs       # 动作执行命令
│   ├── clipboard.rs    # 剪贴板命令
│   ├── fs.rs           # 文件系统命令
│   └── shell.rs        # Shell 命令
├── error.rs            # 错误类型定义
├── state.rs            # 状态管理
└── lib.rs              # 主入口（注册命令、插件）
```

### 反模式清单

| 反模式 | 正确做法 |
|--------|----------|
| 命令返回 `Result<T, String>` | 使用 `Result<T, AppError>` |
| 使用 `.unwrap()` | 使用 `?` 或 `map_err` |
| 硬编码路径 | 使用 `BaseDirectory` 枚举 |
| 同步阻塞命令 | 使用 `async` 函数 |
| 无输入验证 | 验证所有参数 |

---

## UI 开发规范

### 禁止使用 Emoji
- **严格禁止** 在代码中使用 emoji 作为图标
- **必须** 使用 Icon 组件（`src/shared/ui/Icon.tsx`）
- **可用图标**：Tabler 图标集（106 个预打包图标）

### 图标使用示例
```tsx
import { Icon } from '../shared/ui/Icon';

<Icon name="settings" size={20} className="text-primary" />
```

### 添加新图标
```bash
pnpm bundle-icons
```
编辑 `scripts/bundle-icons.ts` 中的 `DEFAULT_ICONS` 数组添加新图标。

---

## 参考文档

项目 `reference/` 目录包含竞品分析和开发路线图，开发前建议查阅：

### 目录结构
```
reference/
├── competitive-analysis.html      # 竞品分析文档
└── development-roadmap.html       # 开发路线图（7层28任务）
```

### 核心参考文档
- **竞品分析**：`reference/competitive-analysis.html` - 对比竞品的技术架构和功能特性
- **开发路线图**：`reference/development-roadmap.html` - 分层开发计划（L0-L7），包含任务详情和验收标准

**开发具体功能前**，先查看路线图对应层级和参考项目实现。

## 技能参考

已安装的开发技能：
- `~/.agents/skills/desktop-app` - 桌面应用开发指南
- `~/.agents/skills/tauri` - Tauri 框架最佳实践

**开发新功能前**，建议先查阅相关技能文档。

## 技术栈

| 组件 | 技术 | 用途 |
|------|------|------|
| 框架 | Tauri v2 | 桌面应用框架 |
| 后端 | Rust | 系统集成、AI 调用 |
| 前端 | React 19 | UI 组件 |
| 构建 | Vite | 前端构建 |
| 样式 | TailwindCSS v4 | CSS 框架 |
| AI | Vercel AI SDK | 流式 AI 调用 |
