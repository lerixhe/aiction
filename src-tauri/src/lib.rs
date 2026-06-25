mod commands;
mod error;
mod events;
mod settings;
mod state;

use tauri::Manager;
use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::default())
        .setup(|app| {
            let state = app.state::<AppState>();
            state.init_settings_store(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // basic commands
            commands::greet,
            commands::get_version,
            commands::initialize,
            // state commands
            commands::get_app_state,
            commands::update_ai_config,
            // settings commands
            commands::get_settings,
            commands::update_settings,
            commands::export_settings,
            commands::export_settings_to_file,
            commands::import_settings,
            commands::import_settings_from_file,
            commands::reset_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
