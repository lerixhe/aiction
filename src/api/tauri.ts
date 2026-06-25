import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import {
  TAURI_COMMANDS,
  TAURI_EVENTS,
  type SelectionChangedPayload,
  type AiStreamDeltaPayload,
  type AiStreamErrorPayload,
  type StateChangedPayload,
  type AppStateSnapshot,
  type AiConfig,
} from "~/shared/events";

// 命令调用封装
export async function greet(name: string): Promise<string> {
  return await invoke<string>(TAURI_COMMANDS.GREET, { name });
}

export async function getVersion(): Promise<string> {
  return await invoke<string>(TAURI_COMMANDS.GET_VERSION);
}

export async function initialize(): Promise<boolean> {
  return await invoke<boolean>(TAURI_COMMANDS.INITIALIZE);
}

export async function getAppState(): Promise<AppStateSnapshot> {
  return await invoke<AppStateSnapshot>(TAURI_COMMANDS.GET_APP_STATE);
}

export async function updateAiConfig(update: Partial<AiConfig>): Promise<void> {
  await invoke(TAURI_COMMANDS.UPDATE_AI_CONFIG, { update });
}

// 事件监听封装
export function onSelectionChanged(
  callback: (payload: SelectionChangedPayload) => void
): Promise<UnlistenFn> {
  return listen<SelectionChangedPayload>(
    TAURI_EVENTS.SELECTION_CHANGED,
    (event) => callback(event.payload)
  );
}

export function onAiStreamStart(
  callback: () => void
): Promise<UnlistenFn> {
  return listen(TAURI_EVENTS.AI_STREAM_START, () => callback());
}

export function onAiStreamDelta(
  callback: (payload: AiStreamDeltaPayload) => void
): Promise<UnlistenFn> {
  return listen<AiStreamDeltaPayload>(
    TAURI_EVENTS.AI_STREAM_DELTA,
    (event) => callback(event.payload)
  );
}

export function onAiStreamEnd(
  callback: () => void
): Promise<UnlistenFn> {
  return listen(TAURI_EVENTS.AI_STREAM_END, () => callback());
}

export function onAiStreamError(
  callback: (payload: AiStreamErrorPayload) => void
): Promise<UnlistenFn> {
  return listen<AiStreamErrorPayload>(
    TAURI_EVENTS.AI_STREAM_ERROR,
    (event) => callback(event.payload)
  );
}

export function onStateChanged(
  callback: (payload: StateChangedPayload) => void
): Promise<UnlistenFn> {
  return listen<StateChangedPayload>(
    TAURI_EVENTS.STATE_CHANGED,
    (event) => callback(event.payload)
  );
}
