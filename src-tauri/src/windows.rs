use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

pub const WINDOW_LABEL_MAIN: &str = "main";
pub const WINDOW_LABEL_TOOLBAR: &str = "toolbar";
pub const WINDOW_LABEL_CHAT: &str = "chat";

pub fn ensure_main_window(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(WINDOW_LABEL_MAIN) {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn toggle_main_window(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(WINDOW_LABEL_MAIN) {
        if window.is_visible().unwrap_or(false) {
            window.hide().map_err(|e| e.to_string())?;
        } else {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

pub fn ensure_toolbar_window(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(WINDOW_LABEL_TOOLBAR) {
        window.show().map_err(|e| e.to_string())?;
    } else {
        let window = WebviewWindowBuilder::new(
            app,
            WINDOW_LABEL_TOOLBAR,
            WebviewUrl::App("/#/toolbar".into()),
        )
        .title("AIction Toolbar")
        .inner_size(400.0, 48.0)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .visible(false)
        .build()
        .map_err(|e| e.to_string())?;
        window.show().map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn hide_toolbar_window(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(WINDOW_LABEL_TOOLBAR) {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn ensure_chat_window(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(WINDOW_LABEL_CHAT) {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    } else {
        let window = WebviewWindowBuilder::new(
            app,
            WINDOW_LABEL_CHAT,
            WebviewUrl::App("/#/chat".into()),
        )
        .title("AIction Chat")
        .inner_size(420.0, 600.0)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .visible(false)
        .build()
        .map_err(|e| e.to_string())?;
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn hide_chat_window(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(WINDOW_LABEL_CHAT) {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn position_toolbar_window(
    app: &AppHandle,
    x: f64,
    y: f64,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(WINDOW_LABEL_TOOLBAR) {
        window
            .set_position(tauri::Position::Logical(tauri::LogicalPosition::new(x, y)))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn resize_toolbar_window(
    app: &AppHandle,
    width: f64,
    height: f64,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(WINDOW_LABEL_TOOLBAR) {
        window
            .set_size(tauri::Size::Logical(tauri::LogicalSize::new(width, height)))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
