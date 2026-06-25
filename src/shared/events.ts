// Tauri 命令名称常量
export const TAURI_COMMANDS = {
  // basic commands
  GREET: "greet",
  GET_VERSION: "get_version",
  INITIALIZE: "initialize",
  // state commands
  GET_APP_STATE: "get_app_state",
  // settings commands
  GET_SETTINGS: "get_settings",
  UPDATE_SETTINGS: "update_settings",
  EXPORT_SETTINGS: "export_settings",
  EXPORT_SETTINGS_TO_FILE: "export_settings_to_file",
  IMPORT_SETTINGS: "import_settings",
  IMPORT_SETTINGS_FROM_FILE: "import_settings_from_file",
  RESET_SETTINGS: "reset_settings",
} as const;

// Tauri 事件名称常量
export const TAURI_EVENTS = {
  STATE_CHANGED: "state:changed",
} as const;

// 事件载荷类型
export interface StateChangedPayload {
  key: string;
  value: unknown;
}

// 应用状态类型
export interface AppStateSnapshot {
  initialized: boolean;
}
