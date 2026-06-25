// Tauri 命令名称常量
export const TAURI_COMMANDS = {
  GREET: "greet",
  GET_VERSION: "get_version",
  INITIALIZE: "initialize",
  GET_APP_STATE: "get_app_state",
  UPDATE_AI_CONFIG: "update_ai_config",
} as const;

// Tauri 事件名称常量
export const TAURI_EVENTS = {
  SELECTION_CHANGED: "selection:changed",
  AI_STREAM_START: "ai:stream:start",
  AI_STREAM_DELTA: "ai:stream:delta",
  AI_STREAM_END: "ai:stream:end",
  AI_STREAM_ERROR: "ai:stream:error",
  STATE_CHANGED: "state:changed",
} as const;

// 事件载荷类型
export interface SelectionChangedPayload {
  text: string;
  app_name?: string;
  window_title?: string;
}

export interface AiStreamDeltaPayload {
  delta: string;
  reasoning?: string;
}

export interface AiStreamErrorPayload {
  code: string;
  message: string;
}

export interface StateChangedPayload {
  key: string;
  value: unknown;
}

// 应用状态类型
export interface AiConfig {
  api_key?: string;
  model?: string;
  provider?: string;
}

export interface AppStateSnapshot {
  initialized: boolean;
  ai_config: AiConfig;
  clipboard_monitor_active: boolean;
}
