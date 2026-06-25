import { invoke } from "@tauri-apps/api/core";
import {
  TAURI_COMMANDS,
  type AppStateSnapshot,
  type PositionPayload,
  type SizePayload,
} from "~/shared/events";
import type { AppSettings, SettingsUpdate } from "~/shared/types";

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
