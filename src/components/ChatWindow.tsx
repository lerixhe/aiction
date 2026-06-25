import { useState, useCallback, useEffect } from 'react';
import { Icon } from '~/shared/ui';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from '~/hooks/use-chat';
import { hideChatWindow } from '~/api/tauri';

interface ChatWindowProps {
  initialMessage?: string;
  className?: string;
}

export function ChatWindow({ initialMessage, className = '' }: ChatWindowProps) {
  const { messages, isLoading, error, sendMessage, stopStreaming, clearMessages } = useChat();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (initialMessage && !hasInitialized) {
      sendMessage(initialMessage);
      setHasInitialized(true);
    }
  }, [initialMessage, hasInitialized, sendMessage]);

  const handleClose = useCallback(async () => {
    await hideChatWindow();
  }, []);

  const handleClear = useCallback(() => {
    clearMessages();
    setHasInitialized(false);
  }, [clearMessages]);

  return (
    <div
      className={`flex flex-col h-screen bg-white dark:bg-gray-900 ${className}`}
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Icon name="sparkles" size={18} className="text-indigo-500" />
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            AI 对话
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100
              dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="清空对话"
          >
            <Icon name="trash" size={16} />
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100
              dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="关闭"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      </header>

      <MessageList messages={messages} isLoading={isLoading} className="flex-1 overflow-y-auto" />

      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <Icon name="alert-circle" size={14} />
            {error}
          </p>
        </div>
      )}

      <ChatInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isLoading={isLoading}
      />
    </div>
  );
}
