use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

pub fn register_shortcuts(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let shortcut = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyA);

    app.global_shortcut().on_shortcut(shortcut, move |app, _shortcut, event| {
        if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
            log::info!("Global shortcut triggered: toggle main window");
            if let Some(window) = app.get_webview_window("main") {
                if let Err(e) = window.show() {
                    log::error!("Failed to show window: {}", e);
                }
                if let Err(e) = window.set_focus() {
                    log::error!("Failed to focus window: {}", e);
                }
            }
        }
    })?;

    Ok(())
}
