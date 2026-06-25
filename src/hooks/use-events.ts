import { useEffect, useRef } from "react";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import {
  TAURI_EVENTS,
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

export function useStateChanged(
  callback: (payload: StateChangedPayload) => void
) {
  useEventListen(TAURI_EVENTS.STATE_CHANGED, callback);
}
