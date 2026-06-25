import { invoke } from "@tauri-apps/api/core";
import {
  TAURI_COMMANDS,
  type AppStateSnapshot,
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
