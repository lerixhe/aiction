mod commands;
mod error;
mod events;
mod state;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            // basic commands
            commands::greet,
            commands::get_version,
            commands::initialize,
            // state commands
            commands::get_app_state,
            commands::update_ai_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
