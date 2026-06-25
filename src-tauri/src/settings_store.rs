use std::sync::{Mutex, OnceLock};

use crate::error::AppError;

type SettingsStore = std::sync::Arc<tauri_plugin_store::Store<tauri::Wry>>;

static SETTINGS_STORE: OnceLock<Mutex<SettingsStore>> = OnceLock::new();

pub fn init_settings_store(app: &tauri::AppHandle) -> Result<(), AppError> {
    let store = tauri_plugin_store::StoreBuilder::new(app, "settings.json")
        .build()
        .map_err(|e| AppError::Custom(format!("Failed to create store: {}", e)))?;
    SETTINGS_STORE
        .set(Mutex::new(store))
        .map_err(|_| AppError::Custom("Store already initialized".to_string()))?;
    Ok(())
}

pub fn get_settings_store() -> Result<std::sync::MutexGuard<'static, SettingsStore>, AppError> {
    SETTINGS_STORE
        .get()
        .ok_or_else(|| AppError::Custom("Store not initialized".to_string()))?
        .lock()
        .map_err(|e| AppError::Lock(format!("settings_store: {}", e)))
}
