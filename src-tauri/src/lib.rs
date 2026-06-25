mod commands;
mod error;
mod events;
mod settings;
mod settings_store;
mod shortcuts;
mod state;
mod tray;
mod windows;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(AppState::default())
        .setup(|app| {
            settings_store::init_settings_store(app.handle())?;
            tray::create_tray(app)?;
            shortcuts::register_shortcuts(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // basic commands
            commands::greet,
            commands::get_version,
            commands::initialize,
            // state commands
            commands::get_app_state,
            // settings commands
            commands::get_settings,
            commands::update_settings,
            commands::export_settings,
            commands::export_settings_to_file,
            commands::import_settings,
            commands::import_settings_from_file,
            commands::reset_settings,
            // window commands
            commands::show_main_window,
            commands::toggle_main_window,
            commands::show_toolbar_window,
            commands::hide_toolbar_window,
            commands::show_chat_window,
            commands::hide_chat_window,
            commands::position_toolbar,
            commands::resize_toolbar,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
