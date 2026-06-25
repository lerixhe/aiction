use serde::{Deserialize, Serialize};
use std::sync::{Mutex, OnceLock};
use std::sync::Arc;

use crate::error::AppError;

type SettingsStore = Arc<tauri_plugin_store::Store<tauri::Wry>>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiConfig {
    pub api_key: Option<String>,
    pub model: Option<String>,
    pub provider: Option<String>,
}

impl Default for AiConfig {
    fn default() -> Self {
        Self {
            api_key: None,
            model: None,
            provider: None,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct AppStateSnapshot {
    pub initialized: bool,
    pub ai_config: AiConfig,
    pub clipboard_monitor_active: bool,
}

pub struct AppState {
    initialized: Mutex<bool>,
    ai_config: Mutex<AiConfig>,
    clipboard_monitor_active: Mutex<bool>,
    settings_store: OnceLock<SettingsStore>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            initialized: Mutex::new(false),
            ai_config: Mutex::new(AiConfig::default()),
            clipboard_monitor_active: Mutex::new(false),
            settings_store: OnceLock::new(),
        }
    }

    pub fn init_settings_store(&self, app: &tauri::AppHandle) -> Result<(), AppError> {
        let store = tauri_plugin_store::StoreBuilder::new(app, "settings.json")
            .build()
            .map_err(|e| AppError::Custom(format!("Failed to create store: {}", e)))?;
        self.settings_store
            .set(store)
            .map_err(|_| AppError::Custom("Store already initialized".to_string()))?;
        Ok(())
    }

    pub fn get_settings_store(&self) -> Result<&SettingsStore, AppError> {
        self.settings_store
            .get()
            .ok_or_else(|| AppError::Custom("Store not initialized".to_string()))
    }

    fn lock_mutex<'a, T>(mutex: &'a Mutex<T>, name: &str) -> Result<std::sync::MutexGuard<'a, T>, AppError> {
        mutex.lock().map_err(|e| AppError::Lock(format!("{}: {}", name, e)))
    }

    pub fn set_initialized(&self, value: bool) -> Result<(), AppError> {
        let mut initialized = Self::lock_mutex(&self.initialized, "initialized")?;
        *initialized = value;
        Ok(())
    }

    pub fn is_initialized(&self) -> Result<bool, AppError> {
        let initialized = Self::lock_mutex(&self.initialized, "initialized")?;
        Ok(*initialized)
    }

    pub fn set_ai_config(&self, config: AiConfig) -> Result<(), AppError> {
        let mut ai_config = Self::lock_mutex(&self.ai_config, "ai_config")?;
        *ai_config = config;
        Ok(())
    }

    pub fn get_ai_config(&self) -> Result<AiConfig, AppError> {
        let ai_config = Self::lock_mutex(&self.ai_config, "ai_config")?;
        Ok(ai_config.clone())
    }

    pub fn update_ai_config(&self, update: AiConfig) -> Result<AiConfig, AppError> {
        let mut ai_config = Self::lock_mutex(&self.ai_config, "ai_config")?;
        if let Some(key) = update.api_key {
            ai_config.api_key = Some(key);
        }
        if let Some(model) = update.model {
            ai_config.model = Some(model);
        }
        if let Some(provider) = update.provider {
            ai_config.provider = Some(provider);
        }
        Ok(ai_config.clone())
    }

    pub fn set_clipboard_monitor_active(&self, active: bool) -> Result<(), AppError> {
        let mut monitor = Self::lock_mutex(&self.clipboard_monitor_active, "clipboard_monitor_active")?;
        *monitor = active;
        Ok(())
    }

    pub fn is_clipboard_monitor_active(&self) -> Result<bool, AppError> {
        let monitor = Self::lock_mutex(&self.clipboard_monitor_active, "clipboard_monitor_active")?;
        Ok(*monitor)
    }

    pub fn snapshot(&self) -> Result<AppStateSnapshot, AppError> {
        let initialized = Self::lock_mutex(&self.initialized, "initialized")?;
        let ai_config = Self::lock_mutex(&self.ai_config, "ai_config")?;
        let clipboard_monitor_active = Self::lock_mutex(&self.clipboard_monitor_active, "clipboard_monitor_active")?;

        Ok(AppStateSnapshot {
            initialized: *initialized,
            ai_config: ai_config.clone(),
            clipboard_monitor_active: *clipboard_monitor_active,
        })
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}
