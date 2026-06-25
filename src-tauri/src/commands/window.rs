use serde::{Deserialize, Serialize};
use tauri::command;

use crate::error::AppError;
use crate::windows;

#[derive(Debug, Serialize, Deserialize)]
pub struct PositionPayload {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SizePayload {
    pub width: f64,
    pub height: f64,
}

#[command]
pub async fn show_main_window(app: tauri::AppHandle) -> Result<(), AppError> {
    windows::ensure_main_window(&app).map_err(AppError::Window)?;
    Ok(())
}

#[command]
pub async fn toggle_main_window(app: tauri::AppHandle) -> Result<(), AppError> {
    windows::toggle_main_window(&app).map_err(AppError::Window)?;
    Ok(())
}

#[command]
pub async fn show_toolbar_window(app: tauri::AppHandle) -> Result<(), AppError> {
    windows::ensure_toolbar_window(&app).map_err(AppError::Window)?;
    Ok(())
}

#[command]
pub async fn hide_toolbar_window(app: tauri::AppHandle) -> Result<(), AppError> {
    windows::hide_toolbar_window(&app).map_err(AppError::Window)?;
    Ok(())
}

#[command]
pub async fn show_chat_window(app: tauri::AppHandle) -> Result<(), AppError> {
    windows::ensure_chat_window(&app).map_err(AppError::Window)?;
    Ok(())
}

#[command]
pub async fn hide_chat_window(app: tauri::AppHandle) -> Result<(), AppError> {
    windows::hide_chat_window(&app).map_err(AppError::Window)?;
    Ok(())
}

#[command]
pub async fn position_toolbar(
    app: tauri::AppHandle,
    position: PositionPayload,
) -> Result<(), AppError> {
    windows::position_toolbar_window(&app, position.x, position.y).map_err(AppError::Window)?;
    Ok(())
}

#[command]
pub async fn resize_toolbar(
    app: tauri::AppHandle,
    size: SizePayload,
) -> Result<(), AppError> {
    windows::resize_toolbar_window(&app, size.width, size.height).map_err(AppError::Window)?;
    Ok(())
}
