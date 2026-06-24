use tauri::Manager;

mod commands;
mod error;
mod state;

pub use error::AppError;
pub use state::{AppState, AiConfig};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(AppState::new())
    .plugin(tauri_plugin_store::Builder::default().build())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_clipboard_manager::init())
    .plugin(tauri_plugin_global_shortcut::Builder::default().build())
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())
    .setup(|app| {
      let app_data_dir = app.path().app_data_dir().expect("failed to get app data dir");
      std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
      
      log::info!("AIction started");
      log::info!("App data directory: {:?}", app_data_dir);
      
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      // 基础命令
      commands::basic::greet,
      commands::basic::get_app_version,
      commands::basic::get_app_data_dir,
      commands::basic::get_current_time,
      
      // AI 命令
      commands::ai::test_api_connection,
      commands::ai::fetch_models,
      commands::ai::send_chat_message,
      
      // 动作命令
      commands::action::execute_action,
      commands::action::get_actions,
      commands::action::save_action,
      commands::action::delete_action,
      
      // 剪贴板命令
      commands::clipboard::get_clipboard_content,
      commands::clipboard::set_clipboard_text,
      commands::clipboard::start_clipboard_monitor,
      commands::clipboard::stop_clipboard_monitor,
      
      // 文件系统命令
      commands::fs::read_file,
      commands::fs::write_file,
      commands::fs::list_directory,
      commands::fs::file_exists,
      commands::fs::create_directory,
      commands::fs::delete_file,
      
      // Shell 命令
      commands::shell::execute_shell_command,
      commands::shell::check_command_exists,
      commands::shell::get_system_info
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
