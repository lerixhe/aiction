# AIction

> Select text → Trigger AI → Continue conversation

A lightweight desktop application that provides AI assistance for selected content. Built with Tauri v2, Rust, and React.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green)](package.json)

**[中文文档](./README.zh-CN.md)**

## Features

**Inline AI Toolbar**

Select text anywhere, and a toolbar appears with configurable AI actions.

**Floating Chat Panel**

Continue conversations in a draggable, resizable panel with streaming responses.

**Custom Actions**

Create your own prompt templates using `{text}` placeholder. Built-in actions:

| Action | Template |
|--------|----------|
| Explain | `Help me explain the selected content "{text}"` |
| Translate | `Please translate the following content to Simplified Chinese:\n{text}` |

**Multi-Model Support**

OpenAI, Anthropic Claude, Google Gemini, DeepSeek, OpenRouter, or any OpenAI-compatible API.

**Additional Features**

- Thinking Chain Display — View model reasoning process (DeepSeek `reasoning_content`, etc.)
- Dark Mode — Auto / Light / Dark themes
- System Tray — Minimize to tray for quick access
- Global Shortcuts — Trigger actions with keyboard shortcuts
- Clipboard Monitoring — Automatically detect and process clipboard content
- File Operations — Read, write, and process files
- Shell Commands — Execute system commands with AI assistance

## Installation

**Download**

Download the latest version for your platform from the [Releases](https://github.com/lerixhe/aiction/releases) page.

**Build from Source**

```bash
git clone https://github.com/lerixhe/aiction.git
cd aiction
pnpm install
pnpm build:tauri
```

## Quick Start

1. Launch the application
2. Click the settings icon to configure AI provider
3. Add model service (API URL + Key + Model)
4. Click "Test Connection"
5. Select text anywhere → Click toolbar → Choose action

## Configuration

### Model Service

| Field | Description | Example |
|-------|-------------|---------|
| API Base URL | OpenAI-compatible endpoint | `https://api.openai.com/v1` |
| API Key | API key | `sk-...` |
| Model | Model identifier | `gpt-4o-mini` |

### Model Parameters

| Parameter | Default | Range |
|-----------|---------|-------|
| Max Tokens | 1024 | 1 - 32768 |
| Temperature | 0.3 | 0 - 2 |
| Top P | 0.9 | 0 - 1 |
| Presence Penalty | 0 | -2 - 2 |
| Frequency Penalty | 0 | -2 - 2 |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Tauri v2 Application                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Rust Backend                           │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌───────────────────┐ │  │
│  │  │ AI Client   │ │ Action Engine│ │ System Integration│ │  │
│  │  │ (Vercel SDK)│ │              │ │                   │ │  │
│  │  └─────────────┘ └──────────────┘ └───────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │ Tauri IPC (invoke/events)       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    React Frontend                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │  │
│  │  │ Action   │ │ Chat     │ │ Settings │ │ File       │  │  │
│  │  │ Toolbar  │ │ Panel    │ │          │ │ Drag & Drop│  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

Detailed architecture documentation: [docs/WIKI.md](docs/WIKI.md)

## Tech Stack

- [Tauri v2](https://tauri.app/) — Desktop framework
- Rust — Backend language
- React 19 + TypeScript
- Vite — Build tool
- TailwindCSS v4 — CSS framework
- [Vercel AI SDK](https://sdk.vercel.ai/) — Streaming AI calls

## Development

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server |
| `pnpm dev:tauri` | Start Tauri dev mode |
| `pnpm build` | Build frontend only |
| `pnpm build:tauri` | Build complete application |
| `pnpm typecheck` | TypeScript type checking |

### Path Aliases

Both `~/*` and `@/*` map to `src/*`:

```typescript
import { useUiTheme } from "@/shared/ui/theme"
```

### Verification After Changes

1. Run `pnpm typecheck` and `pnpm build`
2. Run `pnpm dev:tauri` to test in development mode
3. Run `pnpm build:tauri` to build production version

## Contributing

1. Fork the repository
2. Create branch: `git checkout -b feature/xxx`
3. Make changes
4. Run `pnpm typecheck` and `pnpm build`
5. Test the application
6. Submit Pull Request

## License

[GPL-3.0](LICENSE)
