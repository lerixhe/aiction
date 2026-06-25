#[cfg(target_os = "macos")]
pub mod macos;

#[cfg(target_os = "windows")]
pub mod windows;

pub mod position;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SelectionResult {
    pub text: String,
    pub position: Option<CursorPosition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CursorPosition {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SelectionState {
    Text(SelectionResult),
    Empty,
    Unavailable,
}

pub trait SelectionDetector {
    fn get_selected_text(&self) -> SelectionState;
    fn get_cursor_position(&self) -> Option<CursorPosition>;
}

pub fn create_detector() -> Box<dyn SelectionDetector> {
    #[cfg(target_os = "macos")]
    {
        Box::new(macos::MacOsSelectionDetector::new())
    }

    #[cfg(target_os = "windows")]
    {
        Box::new(windows::WindowsSelectionDetector::new())
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        compile_error!("Unsupported platform for selection detection");
    }
}

pub fn check_accessibility_permission() -> bool {
    #[cfg(target_os = "macos")]
    {
        macos::MacOsSelectionDetector::new().check_accessibility()
    }

    #[cfg(target_os = "windows")]
    {
        true // Windows doesn't need special accessibility permission
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        false
    }
}

pub fn request_accessibility_permission() -> bool {
    #[cfg(target_os = "macos")]
    {
        macos::MacOsSelectionDetector::request_accessibility()
    }

    #[cfg(target_os = "windows")]
    {
        true // Windows doesn't need special accessibility permission
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        false
    }
}
