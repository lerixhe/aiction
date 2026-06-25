use tauri::{Emitter, State};

use crate::error::AppResult;
use crate::events::{event_names, StateChangedPayload};
use crate::state::{AppState, AppStateSnapshot, AiConfig};

#[tauri::command]
pub fn get_app_state(state: State<'_, AppState>) -> AppResult<AppStateSnapshot> {
    state.snapshot()
}

#[tauri::command]
pub fn update_ai_config(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
    update: AiConfig,
) -> AppResult<()> {
    let config = state.update_ai_config(update)?;

    if let Err(e) = app.emit(
        event_names::STATE_CHANGED,
        StateChangedPayload {
            key: "ai_config".to_string(),
            value: serde_json::to_value(config).unwrap_or_default(),
        },
    ) {
        log::warn!("Failed to emit state changed event: {}", e);
    }

    Ok(())
}
