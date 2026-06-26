use crate::error::AppError;
use crate::selection::{self, SelectionResult, SelectionState};
use crate::selection::position::{PositionCalculator, ToolbarPosition};
use crate::state::AppState;
use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct SelectionResponse {
    pub state: SelectionState,
    pub toolbar_position: Option<ToolbarPosition>,
}

/// 按需捕获当前选区文本（类似 Kivio 的 capture_active_selection）
/// 优先使用 Accessibility API，失败时 fallback 到 Cmd+C
#[command]
pub async fn capture_selection(state: State<'_, AppState>) -> Result<SelectionResponse, AppError> {
    info!("Capturing active selection");

    match selection::capture_active_selection() {
        Some(text) => {
            info!("Selection captured: {} chars", text.len());

            // 获取鼠标位置作为工具栏定位参考
            let cursor_pos = get_mouse_position();
            let result = SelectionResult {
                text,
                position: cursor_pos,
            };

            // Store in pending selection
            state.set_pending_selection(Some(result.clone()))?;

            // Calculate toolbar position
            let toolbar_position = if let Some(ref cursor) = result.position {
                let screen = selection::position::get_screen_bounds();
                let calculator = PositionCalculator::new(400.0, 48.0)
                    .with_offset(20.0)
                    .with_margin(10.0);
                Some(calculator.calculate_position(cursor, &screen))
            } else {
                None
            };

            Ok(SelectionResponse {
                state: SelectionState::Text(result),
                toolbar_position,
            })
        }
        None => {
            debug!("No selection captured");
            Ok(SelectionResponse {
                state: SelectionState::Empty,
                toolbar_position: None,
            })
        }
    }
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

#[command]
pub async fn take_pending_selection(state: State<'_, AppState>) -> Result<Option<SelectionResult>, AppError> {
    debug!("Taking pending selection");
    state.take_pending_selection()
}

#[command]
pub async fn has_pending_selection(state: State<'_, AppState>) -> Result<bool, AppError> {
    state.has_pending_selection()
}

#[command]
pub async fn get_cursor_position() -> Result<Option<crate::selection::CursorPosition>, AppError> {
    Ok(get_mouse_position())
}

#[command]
pub async fn calculate_toolbar_position(
    cursor_x: f64,
    cursor_y: f64,
    toolbar_width: f64,
    toolbar_height: f64,
) -> Result<ToolbarPosition, AppError> {
    let cursor = crate::selection::CursorPosition {
        x: cursor_x,
        y: cursor_y,
    };
    let screen = selection::position::get_screen_bounds();
    let calculator = PositionCalculator::new(toolbar_width, toolbar_height)
        .with_offset(20.0)
        .with_margin(10.0);

    Ok(calculator.calculate_position(&cursor, &screen))
}

#[command]
pub async fn check_accessibility_permission() -> Result<bool, AppError> {
    Ok(selection::check_accessibility_permission())
}

#[command]
pub async fn request_accessibility_permission() -> Result<bool, AppError> {
    Ok(selection::request_accessibility_permission())
}
