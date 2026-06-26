use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

use crate::selection;
use crate::selection::position::{PositionCalculator, ToolbarPosition};
use crate::state::AppState;

pub fn register_shortcuts(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    // 快捷键：Cmd+Shift+A 触发选区读取并显示工具栏
    let shortcut = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyA);

    app.global_shortcut().on_shortcut(shortcut, move |app, _shortcut, event| {
        if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
            log::info!("Global shortcut triggered: capture selection");

            // 捕获选区文本
            match selection::capture_active_selection() {
                Some(text) => {
                    log::info!("Selection captured via shortcut: {} chars", text.len());

                    // 获取鼠标位置
                    let cursor_pos = get_mouse_position();

                    // 计算工具栏位置
                    let toolbar_position = if let Some(ref cursor) = cursor_pos {
                        let screen = selection::position::get_screen_bounds();
                        let calculator = PositionCalculator::new(400.0, 48.0)
                            .with_offset(20.0)
                            .with_margin(10.0);
                        Some(calculator.calculate_position(cursor, &screen))
                    } else {
                        None
                    };

                    // 存储到 pending selection
                    let state = app.state::<AppState>();
                    let result = selection::SelectionResult {
                        text: text.clone(),
                        position: cursor_pos,
                    };
                    if let Err(e) = state.set_pending_selection(Some(result)) {
                        log::error!("Failed to store pending selection: {}", e);
                    }

                    // 显示工具栏窗口
                    if let Err(e) = crate::windows::ensure_toolbar_window(app) {
                        log::error!("Failed to ensure toolbar window: {}", e);
                        return;
                    }

                    // 定位工具栏
                    if let Some(ref pos) = toolbar_position {
                        if let Err(e) = crate::windows::position_toolbar_window(app, pos.x, pos.y) {
                            log::error!("Failed to position toolbar: {}", e);
                        }
                    }

                    // 发送事件到前端
                    let event_payload = serde_json::json!({
                        "text": text,
                        "toolbar_position": toolbar_position,
                    });
                    if let Err(e) = app.emit("selection-changed", &event_payload) {
                        log::error!("Failed to emit selection-changed event: {}", e);
                    }
                }
                None => {
                    log::debug!("No selection captured");
                }
            }
        }
    })?;

    Ok(())
}

/// 获取当前鼠标位置
fn get_mouse_position() -> Option<crate::selection::CursorPosition> {
    #[cfg(target_os = "macos")]
    {
        use core_graphics::event::CGEvent;
        use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};

        let source = CGEventSource::new(CGEventSourceStateID::HIDSystemState).ok()?;
        let event = CGEvent::new(source).ok()?;
        let point = event.location();
        Some(crate::selection::CursorPosition {
            x: point.x,
            y: point.y,
        })
    }
    #[cfg(not(target_os = "macos"))]
    {
        None
    }
}
