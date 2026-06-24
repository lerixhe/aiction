# AIction

> Select text → Trigger AI → Continue in chat

A lightweight desktop application for getting AI help on selected content. Built with Tauri v2, Rust, and React.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green)](package.json)

**[中文](./README.zh-CN.md)**

## Features

**Inline AI Toolbar**

Select text anywhere, a toolbar appears with configurable actions.

**Floating Chat Panel**

Continue the conversation in a draggable, resizable panel with streaming responses.

**Custom Actions**

Create your own prompt templates with `{text}` placeholders. Built-in actions:

| Action | Template |
|--------|----------|
| Explain | `Explain the selected content: "{text}"` |
| Translate | `Translate the following to English:\n{text}` |

**Multi-Provider Support**

OpenAI, Anthropic Claude, Google Gemini, DeepSeek, OpenRouter, or any OpenAI-compatible API.

**Other Features**

- Reasoning display — view model thinking process (DeepSeek `reasoning_content`, etc.)
- Dark mode — auto / light / dark theme
- System tray — minimize to tray for quick access
- Global shortcuts — trigger actions with keyboard shortcuts
- Clipboard monitoring — automatically detect and process clipboard content
- File operations — read, write, and process files
- Shell commands — execute system commands with AI assistance

## Install

**Download**

Download the latest release for your platform from the [Releases](https://github.com/lerixhe/aiction/releases) page.

**Build from Source**

```bash
git clone https://github.com/lerixhe/aiction.git
cd aiction
pnpm install
pnpm build:tauri
```

## Quick Start

1. Launch the application
2. Click the settings icon to configure your AI provider
3. Add a model service (API URL + Key + Model)
4. Click "Test Connection"
5. Select text anywhere → click the toolbar → choose an action

## Configuration

### Model Service

| Field | Description | Example |
|-------|-------------|---------|
| API Base URL | OpenAI-compatible endpoint | `https://api.openai.com/v1` |
| API Key | Your API key | `sk-...` |
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
│                    Tauri v2 Application                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Rust Backend                           │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌───────────────────┐ │  │
│  │  │ AI Client   │ │ Action       │ │ System            │ │  │
│  │  │ (Vercel SDK)│ │ Engine       │ │ Integration       │ │  │
│  │  └─────────────┘ └──────────────┘ └───────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │ Tauri IPC (invoke/events)       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    React Frontend                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │  │
│  │  │ Action   │ │ Chat     │ │ Settings │ │ File       │  │  │
│  │  │ Toolbar  │ │ Panel    │ │          │ │ Drop       │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

Detailed architecture: [docs/WIKI.md](docs/WIKI.md)

## Tech Stack

- [Tauri v2](https://tauri.app/) — desktop framework
- Rust — backend language
- React 19 + TypeScript
- Vite — build tool
- TailwindCSS v4 — styling
- [Vercel AI SDK](https://sdk.vercel.ai/) — streaming AI calls

## Development

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server |
| `pnpm dev:tauri` | Start Tauri development mode |
| `pnpm build` | Build frontend only |
| `pnpm build:tauri` | Build complete application |
| `pnpm typecheck` | TypeScript type checking |

### Path Aliases

`~/*` and `@/*` both map to `src/*`:

```typescript
import { useUiTheme } from "@/shared/ui/theme"
```

### After Making Changes

1. Run `pnpm typecheck` and `pnpm build`
2. Run `pnpm dev:tauri` to test in development mode
3. Run `pnpm build:tauri` to build for production

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/xxx`
3. Make your changes
4. Run `pnpm typecheck` and `pnpm build`
5. Test the application
6. Submit a pull request

## License

[GPL-3.0](LICENSE)
