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
  // window commands
  SHOW_MAIN_WINDOW: "show_main_window",
  TOGGLE_MAIN_WINDOW: "toggle_main_window",
  SHOW_TOOLBAR_WINDOW: "show_toolbar_window",
  HIDE_TOOLBAR_WINDOW: "hide_toolbar_window",
  SHOW_CHAT_WINDOW: "show_chat_window",
  HIDE_CHAT_WINDOW: "hide_chat_window",
  POSITION_TOOLBAR: "position_toolbar",
  RESIZE_TOOLBAR: "resize_toolbar",
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

export interface PositionPayload {
  x: number;
  y: number;
}

export interface SizePayload {
  width: number;
  height: number;
}

// 应用状态类型
export interface AppStateSnapshot {
  initialized: boolean;
}

// 窗口标签
export type WindowLabel = "main" | "toolbar" | "chat";
