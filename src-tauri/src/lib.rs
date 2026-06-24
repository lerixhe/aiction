use tauri::Manager;

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::default().build())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_clipboard_manager::init())
    .plugin(tauri_plugin_global_shortcut::Builder::default().build())
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())
    .setup(|app| {
      // 获取应用数据目录
      let app_data_dir = app.path().app_data_dir().expect("failed to get app data dir");
      std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
      
      log::info!("AIction Desktop started");
      log::info!("App data directory: {:?}", app_data_dir);
      
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      // 基础命令
      greet,
      get_app_version,
      get_app_data_dir,
      
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

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to AIction Desktop.", name)
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn get_app_data_dir(app: tauri::AppHandle) -> Result<String, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    Ok(app_data_dir.to_string_lossy().to_string())
}
