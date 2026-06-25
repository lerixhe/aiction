use tauri::State;

use crate::error::AppResult;
use crate::state::{AppState, AppStateSnapshot};

#[tauri::command]
pub fn get_app_state(state: State<'_, AppState>) -> AppResult<AppStateSnapshot> {
    state.snapshot()
}
