use serde::Serialize;
use std::sync::Mutex;

use crate::error::AppError;

#[derive(Debug, Clone, Serialize)]
pub struct AppStateSnapshot {
    pub initialized: bool,
}

pub struct AppState {
    initialized: Mutex<bool>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            initialized: Mutex::new(false),
        }
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

    pub fn snapshot(&self) -> Result<AppStateSnapshot, AppError> {
        let initialized = Self::lock_mutex(&self.initialized, "initialized")?;

        Ok(AppStateSnapshot {
            initialized: *initialized,
        })
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}
