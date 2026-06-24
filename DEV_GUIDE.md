# AIction 开发指南

## 核心概念

Tauri 应用有两个独立的运行时：

| 层 | 语言 | 热更新 | 重新编译时间 |
|---|---|---|---|
| **前端** | React/TypeScript | ✅ Vite HMR（即时） | N/A |
| **后端** | Rust | ❌ 需重新编译 | 1-30秒（取决于改动） |

## 两种开发模式

### 模式 A：完整开发（推荐）

```bash
pnpm dev:tauri
```

**启动内容**：Vite 开发服务器 + Tauri 桌面窗口

**特点**：
- ✅ 可以调用所有 Tauri API（`invoke`、文件操作、系统托盘等）
- ✅ 前端修改即时生效（Vite HMR）
- ✅ Rust 修改后自动重新编译并重启窗口
- ❌ 首次启动需要编译 Rust（5-15秒）

**适用场景**：功能开发、调试 Tauri 命令、测试完整功能

### 模式 B：纯前端开发

```bash
pnpm dev
```

**启动内容**：只启动 Vite 开发服务器

**特点**：
- ✅ 启动快（<1秒）
- ✅ 前端修改即时生效
- ❌ 无法调用 Tauri API（会报错）
- ❌ 没有桌面窗口，需要在浏览器打开 `http://localhost:5173`

**适用场景**：纯 UI 开发、样式调整、布局调试

## 开发流程

### 场景 1：只修改前端（UI/样式/React 组件）

**推荐**：用 `pnpm dev`（快速）或 `pnpm dev:tauri`（完整）

```bash
# 方式 A：纯前端（快，但无法测试 Tauri API）
pnpm dev
# 在浏览器打开 http://localhost:5173

# 方式 B：完整（慢，但可以测试所有功能）
pnpm dev:tauri
```

修改 `src/entrypoints/*.tsx` 时，两种模式都会**即时更新**。

### 场景 2：只修改 Rust 后端

**必须用**：`pnpm dev:tauri`

```bash
pnpm dev:tauri
# 修改 src-tauri/src/*.rs
# → Tauri 自动检测并重新编译（1-30秒）
# → 应用自动重启
```

### 场景 3：同时修改前端和 Rust 后端

**必须用**：`pnpm dev:tauri`

```bash
pnpm dev:tauri

# 开发循环：
# 1. 修改 Rust 代码 → 等待编译 → 应用自动重启
# 2. 修改前端代码 → Vite HMR 即时更新（无需等待）
# 3. 重复
```

## 调试技巧

### 1. 查看 Rust 日志

`pnpm dev:tauri` 会在终端输出所有 `log::info!()` / `log::error!()` 日志：

```rust
// 在 Rust 代码中添加日志
log::info!("用户点击了按钮: {:?}", button_id);
log::error!("API 调用失败: {:?}", error);
```

### 2. 查看前端控制台

在 Tauri 窗口中：
- macOS: `Cmd + Option + I` 打开 DevTools
- Windows/Linux: `Ctrl + Shift + I`

### 3. 快速验证 Rust 改动

如果只想检查 Rust 代码是否编译通过，不启动完整应用：

```bash
cd src-tauri && cargo check
```

比 `cargo build` 快很多，只做类型检查。

### 4. 测试 Tauri API 调用

如果用 `pnpm dev` 在浏览器中测试，Tauri API 会失败。解决方法：

```typescript
// 检查是否在 Tauri 环境中
const isTauri = window.__TAURI_INTERNALS__ !== undefined;

if (isTauri) {
  const result = await invoke('some_command');
} else {
  // 浏览器中的 fallback
  console.log('Not in Tauri environment');
}
```

## 常见工作流

### 工作流 A：只做 UI 开发

```bash
pnpm dev
# 在浏览器打开 http://localhost:5173
# 用浏览器 DevTools 调试
# 修改代码 → 即时看到效果
```

### 工作流 B：开发新功能（需要 Tauri API）

```bash
pnpm dev:tauri

# 1. 在 src-tauri/src/commands/xxx.rs 添加 Rust 命令
# 2. 在 src-tauri/src/lib.rs 注册命令
# 3. 等待 Rust 重新编译（几秒）
# 4. 在前端调用 invoke('new_command', { ... })
# 5. 查看终端 Rust 日志
```

### 工作流 C：调试 API 调用

```bash
pnpm dev:tauri

# 1. Rust: 添加 log::info!() 输出请求/响应
# 2. 前端: 添加 console.log() 输出
# 3. 终端查看 Rust 日志，DevTools 查看前端日志
```

## 性能提示

| 操作 | 耗时 | 优化建议 |
|------|------|----------|
| `cargo check` | 1-5秒 | 只检查不编译，用于快速验证 |
| `cargo build` | 10-30秒 | 首次编译较慢，后续增量编译快 |
| Vite HMR | <1秒 | 即时更新，无需优化 |
| `pnpm dev:tauri` 启动 | 5-15秒 | 首次启动需要编译 Rust |
| `pnpm dev` 启动 | <1秒 | 纯前端，启动很快 |

## 故障排除

### Rust 编译失败

```bash
cd src-tauri && cargo check
# 查看详细错误信息
```

### 前端构建失败

```bash
pnpm typecheck
# 检查 TypeScript 类型错误
```

### Tauri API 调用失败

1. 确认使用 `pnpm dev:tauri` 而不是 `pnpm dev`
2. 检查命令是否在 `lib.rs` 的 `invoke_handler` 中注册
3. 检查参数名称是否匹配（Rust 用 snake_case，前端用 camelCase）
4. 查看终端 Rust 日志输出
