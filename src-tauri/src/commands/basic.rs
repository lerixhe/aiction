use tauri::State;

use crate::error::AppResult;
use crate::state::AppState;

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
    state.set_initialized(true)?;
    Ok(true)
}
