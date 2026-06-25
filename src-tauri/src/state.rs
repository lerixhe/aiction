use serde::Serialize;
use std::sync::Mutex;

use crate::error::AppError;
use crate::selection::SelectionResult;

#[derive(Debug, Clone, Serialize)]
pub struct AppStateSnapshot {
    pub initialized: bool,
    pub has_pending_selection: bool,
}

pub struct AppState {
    initialized: Mutex<bool>,
    pending_selection: Mutex<Option<SelectionResult>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            initialized: Mutex::new(false),
            pending_selection: Mutex::new(None),
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

    pub fn set_pending_selection(&self, selection: Option<SelectionResult>) -> Result<(), AppError> {
        let mut pending = Self::lock_mutex(&self.pending_selection, "pending_selection")?;
        *pending = selection;
        Ok(())
    }

    pub fn take_pending_selection(&self) -> Result<Option<SelectionResult>, AppError> {
        let mut pending = Self::lock_mutex(&self.pending_selection, "pending_selection")?;
        Ok(pending.take())
    }

    pub fn has_pending_selection(&self) -> Result<bool, AppError> {
        let pending = Self::lock_mutex(&self.pending_selection, "pending_selection")?;
        Ok(pending.is_some())
    }

    pub fn snapshot(&self) -> Result<AppStateSnapshot, AppError> {
        let initialized = Self::lock_mutex(&self.initialized, "initialized")?;
        let pending = Self::lock_mutex(&self.pending_selection, "pending_selection")?;

        Ok(AppStateSnapshot {
            initialized: *initialized,
            has_pending_selection: pending.is_some(),
        })
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}
