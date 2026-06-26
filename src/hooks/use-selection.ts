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
      setSelectedText(event.payload.text);
      if (event.payload.toolbar_position) {
        setToolbarPosition(event.payload.toolbar_position);
      }
      setIsVisible(true);
    });

    const unlistenCleared = listen(TAURI_EVENTS.SELECTION_CLEARED, () => {
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
    (_actionId: string, _text: string) => {
      // TODO: Implement action execution
    },
    []
  );

  const handleOpenChat = useCallback(
    (_text: string) => {
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
