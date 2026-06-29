import { useCallback } from 'react';
import { Icon } from '~/shared/ui';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from '~/hooks/use-chat';
import type { Conversation } from '~/shared/types';

interface ChatPanelProps {
  conversation: Conversation | null;
  onConversationUpdate: (conv: Conversation) => void;
  onCreateNew: () => void;
}

export function ChatPanel({ conversation, onConversationUpdate, onCreateNew }: ChatPanelProps) {
  const handleTitleGenerated = useCallback((title: string) => {
    if (conversation) {
      onConversationUpdate({ ...conversation, title });
    }
  }, [conversation, onConversationUpdate]);

  const { messages, isLoading, error, sendMessage, stopStreaming, setMessages } = useChat({
    conversationId: conversation?.id,
    initialMessages: conversation?.messages ?? [],
    onTitleGenerated: handleTitleGenerated,
  });

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Icon name="sparkles" size={28} className="text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
            开始新对话
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            选中任意文本，或直接开始聊天
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg
              hover:bg-indigo-600 transition-colors text-sm font-medium"
          >
            <Icon name="plus" size={16} />
            新建对话
          </button>
        </div>
      </div>
    );
  }

  const handleClear = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 min-w-0">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {conversation.title}
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100
              dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="清空对话"
          >
            <Icon name="trash" size={16} />
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
