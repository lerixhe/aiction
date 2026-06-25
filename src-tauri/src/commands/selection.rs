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

#[command]
pub async fn get_selected_text(state: State<'_, AppState>) -> Result<SelectionResponse, AppError> {
    debug!("Getting selected text");

    let detector = selection::create_detector();
    let selection_state = detector.get_selected_text();

    match &selection_state {
        SelectionState::Text(result) => {
            info!("Selected text found: {} chars", result.text.len());

            // Store in pending selection
            state.set_pending_selection(Some(result.clone()))?;

            // Calculate toolbar position if we have cursor position
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
                state: selection_state,
                toolbar_position,
            })
        }
        SelectionState::Empty => {
            debug!("No text selected");
            Ok(SelectionResponse {
                state: selection_state,
                toolbar_position: None,
            })
        }
        SelectionState::Unavailable => {
            error!("Selection detection unavailable");
            Err(AppError::Selection("Selection detection unavailable".to_string()))
        }
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
    let detector = selection::create_detector();
    Ok(detector.get_cursor_position())
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
