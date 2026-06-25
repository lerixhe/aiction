use tauri::command;
use tauri::AppHandle;
use tauri::State;
use tauri_plugin_dialog::DialogExt;

use crate::error::AppError;
use crate::settings::{AppSettings, SettingsUpdate};
use crate::state::AppState;

const SETTINGS_KEY: &str = "app_settings";

fn load_settings_from_store(state: &AppState) -> Result<AppSettings, AppError> {
    let store = state.get_settings_store()?;

    match store.get(SETTINGS_KEY) {
        Some(value) => {
            let settings: AppSettings = serde_json::from_value(value.clone())
                .map_err(|e| AppError::Custom(format!("Failed to parse settings: {}", e)))?;
            Ok(settings)
        }
        None => Ok(AppSettings::default()),
    }
}

fn save_settings_to_store(state: &AppState, settings: &AppSettings) -> Result<(), AppError> {
    let store = state.get_settings_store()?;

    let value = serde_json::to_value(settings)
        .map_err(|e| AppError::Custom(format!("Failed to serialize settings: {}", e)))?;

    store.set(SETTINGS_KEY.to_string(), value);

    store
        .save()
        .map_err(|e| AppError::Custom(format!("Failed to persist settings: {}", e)))?;

    Ok(())
}

#[command]
pub async fn get_settings(state: State<'_, AppState>) -> Result<AppSettings, AppError> {
    let mut settings = load_settings_from_store(&state)?;
    settings.sanitize();
    Ok(settings)
}

#[command]
pub async fn update_settings(state: State<'_, AppState>, update: SettingsUpdate) -> Result<AppSettings, AppError> {
    let mut settings = load_settings_from_store(&state)?;
    settings.merge_update(update);
    settings.sanitize();
    save_settings_to_store(&state, &settings)?;
    Ok(settings)
}

#[command]
pub async fn export_settings(state: State<'_, AppState>) -> Result<String, AppError> {
    let settings = load_settings_from_store(&state)?;
    let json = serde_json::to_string_pretty(&settings)
        .map_err(|e| AppError::Custom(format!("Failed to export settings: {}", e)))?;
    Ok(json)
}

#[command]
pub async fn export_settings_to_file(app: AppHandle, state: State<'_, AppState>) -> Result<bool, AppError> {
    let settings = load_settings_from_store(&state)?;
    let json = serde_json::to_string_pretty(&settings)
        .map_err(|e| AppError::Custom(format!("Failed to export settings: {}", e)))?;

    let app_clone = app.clone();
    let file_path = tauri::async_runtime::spawn_blocking(move || {
        app_clone
            .dialog()
            .file()
            .set_title("导出设置")
            .set_file_name("aiction-settings.json")
            .add_filter("JSON", &["json"])
            .blocking_save_file()
    })
    .await
    .map_err(|e| AppError::Custom(format!("Dialog task failed: {}", e)))?;

    match file_path {
        Some(path) => {
            if let Some(path_str) = path.as_path() {
                std::fs::write(path_str, json)
                    .map_err(|e| AppError::Custom(format!("Failed to write file: {}", e)))?;
                Ok(true)
            } else {
                Ok(false)
            }
        }
        None => Ok(false),
    }
}

#[command]
pub async fn import_settings(state: State<'_, AppState>, json: String) -> Result<AppSettings, AppError> {
    let mut settings: AppSettings = serde_json::from_str(&json)
        .map_err(|e| AppError::Custom(format!("Failed to parse import: {}", e)))?;
    settings.sanitize();
    save_settings_to_store(&state, &settings)?;
    Ok(settings)
}

#[command]
pub async fn import_settings_from_file(app: AppHandle, state: State<'_, AppState>) -> Result<Option<AppSettings>, AppError> {
    let app_clone = app.clone();
    let file_path = tauri::async_runtime::spawn_blocking(move || {
        app_clone
            .dialog()
            .file()
            .set_title("导入设置")
            .add_filter("JSON", &["json"])
            .blocking_pick_file()
    })
    .await
    .map_err(|e| AppError::Custom(format!("Dialog task failed: {}", e)))?;

    match file_path {
        Some(path) => {
            if let Some(path_str) = path.as_path() {
                let json = std::fs::read_to_string(path_str)
                    .map_err(|e| AppError::Custom(format!("Failed to read file: {}", e)))?;
                let mut settings: AppSettings = serde_json::from_str(&json)
                    .map_err(|e| AppError::Custom(format!("Failed to parse import: {}", e)))?;
                settings.sanitize();
                save_settings_to_store(&state, &settings)?;
                Ok(Some(settings))
            } else {
                Ok(None)
            }
        }
        None => Ok(None),
    }
}

#[command]
pub async fn reset_settings(state: State<'_, AppState>) -> Result<AppSettings, AppError> {
    let settings = AppSettings::default();
    save_settings_to_store(&state, &settings)?;
    Ok(settings)
}
