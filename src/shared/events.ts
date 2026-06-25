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
  // selection commands
  GET_SELECTED_TEXT: "get_selected_text",
  TAKE_PENDING_SELECTION: "take_pending_selection",
  HAS_PENDING_SELECTION: "has_pending_selection",
  GET_CURSOR_POSITION: "get_cursor_position",
  CALCULATE_TOOLBAR_POSITION: "calculate_toolbar_position",
  // ai commands
  STREAM_CHAT: "stream_chat",
  CHAT: "chat",
  ABORT_CHAT: "abort_chat",
  EXECUTE_ACTION: "execute_action",
  TEST_PROVIDER: "test_provider",
  GET_MODELS: "get_models",
} as const;

// Tauri 事件名称常量
export const TAURI_EVENTS = {
  STATE_CHANGED: "state:changed",
  SELECTION_CHANGED: "selection:changed",
  CHAT_STREAM_PREFIX: "chat-stream:",
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

// 选区相关类型
export interface CursorPosition {
  x: number;
  y: number;
}

export interface SelectionResult {
  text: string;
  position?: CursorPosition;
}

export type SelectionState =
  | { Text: SelectionResult }
  | "Empty"
  | "Unavailable";

export interface ToolbarPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SelectionResponse {
  state: SelectionState;
  toolbar_position?: ToolbarPosition;
}

// 应用状态类型
export interface AppStateSnapshot {
  initialized: boolean;
  has_pending_selection: boolean;
}

// 窗口标签
export type WindowLabel = "main" | "toolbar" | "chat";

// AI 相关类型
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamChatRequest {
  providerId: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface StreamChatResponse {
  streamId: string;
}

export interface StreamChunk {
  id: string;
  delta: string;
  reasoningDelta?: string;
  finishReason?: string;
}

export interface ChatResponse {
  id: string;
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface ExecuteActionRequest {
  actionId: string;
  selection: string;
  variables?: Record<string, string>;
  providerId?: string;
  model?: string;
}

export interface TestProviderRequest {
  providerId: string;
}

export interface TestProviderResponse {
  success: boolean;
  message: string;
  models?: string[];
}

export interface GetModelsRequest {
  providerId: string;
}

export interface GetModelsResponse {
  models: string[];
}
