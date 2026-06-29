import { invoke } from "@tauri-apps/api/core";
import {
  TAURI_COMMANDS,
  type AppStateSnapshot,
  type ChatResponse,
  type CursorPosition,
  type ExecuteActionRequest,
  type GetModelsRequest,
  type GetModelsResponse,
  type PositionPayload,
  type SelectionResponse,
  type SelectionResult,
  type SizePayload,
  type StreamChatRequest,
  type StreamChatResponse,
  type TestProviderRequest,
  type TestProviderResponse,
  type ToolbarPosition,
} from "~/shared/events";
import type { AppSettings, Conversation, ConversationSummary, SettingsUpdate } from "~/shared/types";

// 基础命令
export async function greet(name: string): Promise<string> {
  return await invoke<string>(TAURI_COMMANDS.GREET, { name });
}

export async function getVersion(): Promise<string> {
  return await invoke<string>(TAURI_COMMANDS.GET_VERSION);
}

export async function initialize(): Promise<boolean> {
  return await invoke<boolean>(TAURI_COMMANDS.INITIALIZE);
}

// 状态命令
export async function getAppState(): Promise<AppStateSnapshot> {
  return await invoke<AppStateSnapshot>(TAURI_COMMANDS.GET_APP_STATE);
}

// 设置命令
export async function getSettings(): Promise<AppSettings> {
  return await invoke<AppSettings>(TAURI_COMMANDS.GET_SETTINGS);
}

export async function updateSettings(update: SettingsUpdate): Promise<AppSettings> {
  return await invoke<AppSettings>(TAURI_COMMANDS.UPDATE_SETTINGS, { update });
}

export async function exportSettings(): Promise<string> {
  return await invoke<string>(TAURI_COMMANDS.EXPORT_SETTINGS);
}

export async function exportSettingsToFile(): Promise<boolean> {
  return await invoke<boolean>(TAURI_COMMANDS.EXPORT_SETTINGS_TO_FILE);
}

export async function importSettings(json: string): Promise<AppSettings> {
  return await invoke<AppSettings>(TAURI_COMMANDS.IMPORT_SETTINGS, { json });
}

export async function importSettingsFromFile(): Promise<AppSettings | null> {
  return await invoke<AppSettings | null>(TAURI_COMMANDS.IMPORT_SETTINGS_FROM_FILE);
}

export async function resetSettings(): Promise<AppSettings> {
  return await invoke<AppSettings>(TAURI_COMMANDS.RESET_SETTINGS);
}

// 窗口命令
export async function showMainWindow(): Promise<void> {
  await invoke(TAURI_COMMANDS.SHOW_MAIN_WINDOW);
}

export async function toggleMainWindow(): Promise<void> {
  await invoke(TAURI_COMMANDS.TOGGLE_MAIN_WINDOW);
}

export async function showToolbarWindow(): Promise<void> {
  await invoke(TAURI_COMMANDS.SHOW_TOOLBAR_WINDOW);
}

export async function hideToolbarWindow(): Promise<void> {
  await invoke(TAURI_COMMANDS.HIDE_TOOLBAR_WINDOW);
}

export async function showChatWindow(): Promise<void> {
  await invoke(TAURI_COMMANDS.SHOW_CHAT_WINDOW);
}

export async function hideChatWindow(): Promise<void> {
  await invoke(TAURI_COMMANDS.HIDE_CHAT_WINDOW);
}

export async function positionToolbar(position: PositionPayload): Promise<void> {
  await invoke(TAURI_COMMANDS.POSITION_TOOLBAR, { position });
}

export async function resizeToolbar(size: SizePayload): Promise<void> {
  await invoke(TAURI_COMMANDS.RESIZE_TOOLBAR, { size });
}

// 选区命令（按需捕获，类似 Kivio 方案）
export async function captureSelection(): Promise<SelectionResponse> {
  return await invoke<SelectionResponse>(TAURI_COMMANDS.CAPTURE_SELECTION);
}

export async function takePendingSelection(): Promise<SelectionResult | null> {
  return await invoke<SelectionResult | null>(TAURI_COMMANDS.TAKE_PENDING_SELECTION);
}

export async function hasPendingSelection(): Promise<boolean> {
  return await invoke<boolean>(TAURI_COMMANDS.HAS_PENDING_SELECTION);
}

export async function getCursorPosition(): Promise<CursorPosition | null> {
  return await invoke<CursorPosition | null>(TAURI_COMMANDS.GET_CURSOR_POSITION);
}

export async function calculateToolbarPosition(
  cursorX: number,
  cursorY: number,
  toolbarWidth: number,
  toolbarHeight: number
): Promise<ToolbarPosition> {
  return await invoke<ToolbarPosition>(TAURI_COMMANDS.CALCULATE_TOOLBAR_POSITION, {
    cursorX,
    cursorY,
    toolbarWidth,
    toolbarHeight,
  });
}

// AI 命令
export async function streamChat(request: StreamChatRequest): Promise<StreamChatResponse> {
  return await invoke<StreamChatResponse>(TAURI_COMMANDS.STREAM_CHAT, { request });
}

export async function chat(request: StreamChatRequest): Promise<ChatResponse> {
  return await invoke<ChatResponse>(TAURI_COMMANDS.CHAT, { request });
}

export async function abortChat(streamId: string): Promise<boolean> {
  return await invoke<boolean>(TAURI_COMMANDS.ABORT_CHAT, { request: { streamId } });
}

export async function executeAction(request: ExecuteActionRequest): Promise<ChatResponse> {
  return await invoke<ChatResponse>(TAURI_COMMANDS.EXECUTE_ACTION, { request });
}

export async function testProvider(request: TestProviderRequest): Promise<TestProviderResponse> {
  return await invoke<TestProviderResponse>(TAURI_COMMANDS.TEST_PROVIDER, { request });
}

export async function getModels(request: GetModelsRequest): Promise<GetModelsResponse> {
  return await invoke<GetModelsResponse>(TAURI_COMMANDS.GET_MODELS, { request });
}

// 辅助功能权限命令
export async function checkAccessibilityPermission(): Promise<boolean> {
  return await invoke<boolean>(TAURI_COMMANDS.CHECK_ACCESSIBILITY_PERMISSION);
}

export async function requestAccessibilityPermission(): Promise<boolean> {
  return await invoke<boolean>(TAURI_COMMANDS.REQUEST_ACCESSIBILITY_PERMISSION);
}

// 对话命令
export async function getConversations(): Promise<ConversationSummary[]> {
  return await invoke<ConversationSummary[]>(TAURI_COMMANDS.GET_CONVERSATIONS);
}

export async function getConversation(id: string): Promise<Conversation | null> {
  return await invoke<Conversation | null>(TAURI_COMMANDS.GET_CONVERSATION, { id });
}

export async function createConversation(source: string, selectedText?: string): Promise<Conversation> {
  return await invoke<Conversation>(TAURI_COMMANDS.CREATE_CONVERSATION, { source, selectedText });
}

export async function addConversationMessage(id: string, role: string, content: string): Promise<Conversation> {
  return await invoke<Conversation>(TAURI_COMMANDS.ADD_CONVERSATION_MESSAGE, { id, role, content });
}

export async function updateConversationTitle(id: string, title: string): Promise<void> {
  await invoke(TAURI_COMMANDS.UPDATE_CONVERSATION_TITLE, { id, title });
}

export async function deleteConversation(id: string): Promise<void> {
  await invoke(TAURI_COMMANDS.DELETE_CONVERSATION, { id });
}
