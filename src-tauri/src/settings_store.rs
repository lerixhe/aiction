use std::sync::{Mutex, OnceLock};

use crate::error::AppError;
use crate::settings::AppSettings;

type SettingsStore = std::sync::Arc<tauri_plugin_store::Store<tauri::Wry>>;

static SETTINGS_STORE: OnceLock<Mutex<SettingsStore>> = OnceLock::new();

const SETTINGS_KEY: &str = "app_settings";

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

pub fn load_settings() -> Result<AppSettings, AppError> {
    let store = get_settings_store()?;

    match store.get(SETTINGS_KEY) {
        Some(value) => {
            let settings: AppSettings = serde_json::from_value(value.clone())
                .map_err(|e| AppError::Custom(format!("Failed to parse settings: {}", e)))?;
            Ok(settings)
        }
        None => Ok(AppSettings::default()),
    }
}

pub fn save_settings(settings: &AppSettings) -> Result<(), AppError> {
    let store = get_settings_store()?;
    let value = serde_json::to_value(settings)
        .map_err(|e| AppError::Custom(format!("Failed to serialize settings: {}", e)))?;
    store.set(SETTINGS_KEY.to_string(), value);
    store
        .save()
        .map_err(|e| AppError::Custom(format!("Failed to save settings: {}", e)))?;
    Ok(())
}
