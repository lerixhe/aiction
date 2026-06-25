use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    menu::{Menu, MenuItem},
    Manager,
};

pub fn create_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let show_item = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
    let hide_item = MenuItem::with_id(app, "hide", "隐藏主窗口", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_item, &hide_item, &quit_item])?;

    let icon = app
        .default_window_icon()
        .cloned()
        .ok_or("No default window icon configured")?;

    let _tray = TrayIconBuilder::new()
        .icon(icon)
        .menu(&menu)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    if let Err(e) = window.show() {
                        log::error!("Failed to show window: {}", e);
                    }
                    if let Err(e) = window.set_focus() {
                        log::error!("Failed to focus window: {}", e);
                    }
                }
            }
            "hide" => {
                if let Some(window) = app.get_webview_window("main") {
                    if let Err(e) = window.hide() {
                        log::error!("Failed to hide window: {}", e);
                    }
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    if let Err(e) = window.show() {
                        log::error!("Failed to show window: {}", e);
                    }
                    if let Err(e) = window.set_focus() {
                        log::error!("Failed to focus window: {}", e);
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}
