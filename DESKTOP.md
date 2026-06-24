# AIction Desktop

A lightweight AI + Actions efficiency tool built with Tauri v2, Rust, and React.

## Development

### Prerequisites

- Node.js (v20 or later)
- pnpm
- Rust (latest stable)
- Xcode Command Line Tools (macOS)

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run in development mode:
   ```bash
   pnpm dev:tauri
   ```

### Build

1. Build for production:
   ```bash
   pnpm build:tauri
   ```

2. The built application will be located in:
   - macOS: `src-tauri/target/release/bundle/macos/AIction.app`
   - Windows: `src-tauri/target/release/bundle/msi/`
   - Linux: `src-tauri/target/release/bundle/deb/` or `src-tauri/target/release/bundle/appimage/`

### Development Scripts

- `pnpm dev:desktop` - Start Vite dev server for frontend only
- `pnpm dev:tauri` - Start Tauri development mode (frontend + backend)
- `pnpm build:desktop` - Build frontend only
- `pnpm build:tauri` - Build complete Tauri application
- `pnpm typecheck` - Run TypeScript type checking

## Architecture

### Frontend (React + Vite)

- `src/entrypoints/desktop/` - Desktop application entry point
- `src/shared/` - Shared code between Chrome extension and desktop app
- `vite.desktop.config.ts` - Vite configuration for desktop build

### Backend (Rust + Tauri)

- `src-tauri/src/` - Rust backend source code
- `src-tauri/src/commands/` - Tauri command handlers
- `src-tauri/tauri.conf.json` - Tauri configuration

### Key Features

- **Cross-platform**: macOS, Windows, Linux
- **Small footprint**: ~10-15MB (vs Electron ~150MB)
- **Native performance**: Rust backend
- **AI Integration**: Vercel AI SDK support
- **Custom Actions**: User-defined AI actions
- **System Integration**: Tray icon, global shortcuts, clipboard monitoring

## Project Structure

```
aiction/
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Tauri entry point
│   │   ├── lib.rs                # Main library
│   │   └── commands/             # Tauri commands
│   │       ├── ai.rs             # AI API integration
│   │       ├── action.rs         # Action execution
│   │       ├── clipboard.rs      # Clipboard operations
│   │       ├── fs.rs             # File system operations
│   │       └── shell.rs          # Shell command execution
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
│
├── src/
│   ├── entrypoints/
│   │   ├── desktop/              # Desktop app entry point
│   │   │   ├── index.html        # HTML entry
│   │   │   ├── main.tsx          # React entry
│   │   │   ├── App.tsx           # Main component
│   │   │   └── styles.css        # Global styles
│   │   ├── content/              # Chrome extension content script
│   │   └── background/           # Chrome extension background
│   └── shared/                   # Shared code
│
├── vite.desktop.config.ts        # Vite config for desktop
├── postcss.config.js             # PostCSS config
├── tailwind.config.js            # TailwindCSS config
└── package.json                  # Node.js dependencies
```

## Next Steps

### Phase 1: Core Experience (4-6 weeks)
- [ ] Implement text selection detection
- [ ] Create action toolbar UI
- [ ] Implement chat panel
- [ ] Add system tray functionality
- [ ] Configure global shortcuts

### Phase 2: Action Expansion (4-6 weeks)
- [ ] Custom action editor
- [ ] File drag & drop support
- [ ] Clipboard monitoring
- [ ] Ollama local model integration

### Phase 3: System Integration (4-6 weeks)
- [ ] Shell command execution
- [ ] File system operations
- [ ] AI intent routing
- [ ] Scheduled tasks

### Phase 4: Ecosystem (Ongoing)
- [ ] Action marketplace
- [ ] IDE integration
- [ ] File manager context menu
- [ ] Multi-modal support

## License

GPL-3.0
