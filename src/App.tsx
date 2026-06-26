import { Router } from "~/components/Router";
import { SelectionToolbar } from "~/components/SelectionToolbar";
import { ChatWindow } from "~/components/ChatWindow";
import { SettingsPage } from "~/components/settings/SettingsPage";
import { AccessibilityGuide } from "~/components/AccessibilityGuide";
import { useState, useEffect, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { greet, getVersion, hideToolbarWindow, showChatWindow } from "~/api/tauri";
import { TAURI_EVENTS, type SelectionEvent } from "~/shared/events";

function MainContent() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");

  async function handleGreet() {
    setGreetMsg(await greet(name));
  }

  async function handleGetVersion() {
    setVersion(await getVersion());
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
          AIction Desktop
        </h1>

        <AccessibilityGuide />

        <div className="space-y-6 mt-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Tauri v2 + React + TypeScript</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleGetVersion}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                获取版本
              </button>
              <a
                href="#/settings"
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg
                  hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                设置
              </a>
            </div>
            {version && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">版本: {version}</p>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <form
              className="flex gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleGreet();
              }}
            >
              <input
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                placeholder="输入名称..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                打招呼
              </button>
            </form>
            {greetMsg && (
              <p className="mt-4 text-center text-gray-700 dark:text-gray-300">{greetMsg}</p>
            )}
          </div>
        </div>
      </div>
    </main>
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

  const handleOpenChat = useCallback((_text: string) => {
    showChatWindow().catch(console.error);
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
