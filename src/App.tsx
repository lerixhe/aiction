import { Router } from "~/components/Router";
import { SelectionToolbar } from "~/components/SelectionToolbar";
import { ChatWindow } from "~/components/ChatWindow";
import { SettingsPage } from "~/components/settings/SettingsPage";
import { ConversationList } from "~/components/ConversationList";
import { ChatPanel } from "~/components/ChatPanel";
import { useState, useEffect, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { hideToolbarWindow, showMainWindow } from "~/api/tauri";
import { TAURI_EVENTS, type SelectionEvent } from "~/shared/events";
import { useConversations } from "~/hooks/use-conversations";

function MainContent() {
  const {
    summaries,
    activeId,
    activeConversation,
    setActiveConversation,
    selectConversation,
    createNew,
    remove,
    refreshSummaries,
  } = useConversations();

  const handleSelect = useCallback(async (id: string) => {
    await selectConversation(id);
  }, [selectConversation]);

  const handleCreateNew = useCallback(async () => {
    await createNew('manual');
  }, [createNew]);

  const handleDelete = useCallback(async (id: string) => {
    await remove(id);
  }, [remove]);

  const handleConversationUpdate = useCallback((conv: typeof activeConversation) => {
    if (conv) {
      setActiveConversation(conv);
      refreshSummaries();
    }
  }, [setActiveConversation, refreshSummaries]);

  // Listen for selection-triggered conversation creation
  useEffect(() => {
    const unlisten = listen<{ conversationId: string }>('conversation:created', async (event) => {
      await selectConversation(event.payload.conversationId);
      await refreshSummaries();
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [selectConversation, refreshSummaries]);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <ConversationList
        summaries={summaries}
        activeId={activeId}
        onSelect={handleSelect}
        onCreate={handleCreateNew}
        onDelete={handleDelete}
      />
      <ChatPanel
        conversation={activeConversation}
        onConversationUpdate={handleConversationUpdate}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
}

function ToolbarView() {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unlistenSelection = listen<SelectionEvent>(TAURI_EVENTS.SELECTION_CHANGED, (event) => {
      setSelectedText(event.payload.text);
      setIsVisible(true);
    });

    const unlistenCleared = listen(TAURI_EVENTS.SELECTION_CLEARED, () => {
      setSelectedText(null);
      setIsVisible(false);
    });

    return () => {
      unlistenSelection.then((fn) => fn());
      unlistenCleared.then((fn) => fn());
    };
  }, []);

  const handleActionClick = useCallback((_actionId: string, _text: string) => {
    // TODO: Implement action execution
  }, []);

  const handleOpenChat = useCallback(async (text: string) => {
    // Create conversation in main window instead of opening separate chat
    try {
      const { createConversation } = await import('~/api/tauri');
      const conv = await createConversation('selection', text);
      // Emit event so MainContent picks it up
      const { emit } = await import('@tauri-apps/api/event');
      await emit('conversation:created', { conversationId: conv.id });
      await showMainWindow();
      await hideToolbarWindow();
    } catch (err) {
      console.error('Failed to create conversation from selection:', err);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setSelectedText(null);
    hideToolbarWindow().catch(console.error);
  }, []);

  if (!isVisible || !selectedText) {
    return null;
  }

  return (
    <SelectionToolbar
      selectedText={selectedText}
      onActionClick={handleActionClick}
      onOpenChat={handleOpenChat}
      onClose={handleClose}
    />
  );
}

function App() {
  return (
    <Router
      main={<MainContent />}
      toolbar={<ToolbarView />}
      chat={<ChatWindow />}
      settings={<SettingsPage />}
    />
  );
}

export default App;
