import { useCallback, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { TAURI_EVENTS, type SelectionEvent, type ToolbarPosition } from "~/shared/events";
import {
  hideToolbarWindow,
  showToolbarWindow,
  positionToolbar,
  showChatWindow,
} from "~/api/tauri";

export function useSelection() {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unlistenSelection = listen<SelectionEvent>(TAURI_EVENTS.SELECTION_CHANGED, (event) => {
      console.log("Selection changed:", event.payload);
      setSelectedText(event.payload.text);
      if (event.payload.toolbar_position) {
        setToolbarPosition(event.payload.toolbar_position);
      }
      setIsVisible(true);
    });

    const unlistenCleared = listen(TAURI_EVENTS.SELECTION_CLEARED, () => {
      console.log("Selection cleared");
      setSelectedText(null);
      setToolbarPosition(null);
      setIsVisible(false);
    });

    return () => {
      unlistenSelection.then((fn) => fn());
      unlistenCleared.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    if (isVisible && toolbarPosition) {
      positionToolbar({
        x: toolbarPosition.x,
        y: toolbarPosition.y,
      }).catch(console.error);
      showToolbarWindow().catch(console.error);
    } else {
      hideToolbarWindow().catch(console.error);
    }
  }, [isVisible, toolbarPosition]);

  const handleActionClick = useCallback(
    (actionId: string, text: string) => {
      console.log("Action clicked:", actionId, text);
    },
    []
  );

  const handleOpenChat = useCallback(
    (text: string) => {
      console.log("Open chat with:", text);
      showChatWindow().catch(console.error);
    },
    []
  );

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setSelectedText(null);
    setToolbarPosition(null);
    hideToolbarWindow().catch(console.error);
  }, []);

  return {
    selectedText,
    toolbarPosition,
    isVisible,
    handleActionClick,
    handleOpenChat,
    handleClose,
  };
}
