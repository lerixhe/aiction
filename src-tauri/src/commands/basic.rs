use crate::error::AppResult;
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
pub fn initialize(state: State<'_, AppState>) -> AppResult<bool> {
    let mut initialized = state.initialized.lock().map_err(|e| {
        crate::error::AppError::Custom(format!("Failed to lock state: {}", e))
    })?;
    *initialized = true;
    Ok(true)
}
