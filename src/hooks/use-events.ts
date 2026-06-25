import { useEffect, useRef } from "react";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import {
  TAURI_EVENTS,
  type SelectionChangedPayload,
  type AiStreamDeltaPayload,
  type AiStreamErrorPayload,
  type StateChangedPayload,
} from "~/shared/events";

function useEventListen<T>(
  eventName: string,
  callback: (payload: T) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setup = async () => {
      unlisten = await listen<T>(eventName, (event) => {
        callbackRef.current(event.payload);
      });
    };
    setup();

    return () => {
      unlisten?.();
    };
  }, [eventName]);
}

export function useSelectionChanged(
  callback: (payload: SelectionChangedPayload) => void
) {
  useEventListen(TAURI_EVENTS.SELECTION_CHANGED, callback);
}

export function useAiStreamStart(callback: () => void) {
  useEventListen<null>(TAURI_EVENTS.AI_STREAM_START, () => callback());
}

export function useAiStreamDelta(
  callback: (payload: AiStreamDeltaPayload) => void
) {
  useEventListen(TAURI_EVENTS.AI_STREAM_DELTA, callback);
}

export function useAiStreamEnd(callback: () => void) {
  useEventListen<null>(TAURI_EVENTS.AI_STREAM_END, () => callback());
}

export function useAiStreamError(
  callback: (payload: AiStreamErrorPayload) => void
) {
  useEventListen(TAURI_EVENTS.AI_STREAM_ERROR, callback);
}

export function useStateChanged(
  callback: (payload: StateChangedPayload) => void
) {
  useEventListen(TAURI_EVENTS.STATE_CHANGED, callback);
}
