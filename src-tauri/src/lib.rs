mod ai;
mod commands;
mod error;
mod events;
mod selection;
mod settings;
mod settings_store;
mod shortcuts;
mod state;
mod tray;
mod windows;

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use tauri::Manager;
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

            // Load settings into AppState
            let settings = settings_store::load_settings().unwrap_or_default();
            let state = app.state::<AppState>();
            state.update_settings(settings).unwrap_or_else(|e| {
                log::error!("Failed to load settings into state: {}", e);
            });

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
            // selection commands
            commands::get_selected_text,
            commands::take_pending_selection,
            commands::has_pending_selection,
            commands::get_cursor_position,
            commands::calculate_toolbar_position,
            // ai commands
            commands::stream_chat,
            commands::chat,
            commands::abort_chat,
            commands::execute_action,
            commands::test_provider,
            commands::get_models,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
