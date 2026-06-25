import { useEffect, useRef } from 'react';
import { Icon } from '~/shared/ui';
import { MarkdownRenderer } from '~/shared/ui/markdown';
import type { ChatMessage } from '~/shared/events';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  className?: string;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-indigo-100 dark:bg-indigo-900'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        <Icon
          name={isUser ? 'user' : 'bot'}
          size={16}
          className={isUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}
        />
      </div>
      <div
        className={`flex-1 px-4 py-2.5 rounded-2xl max-w-[80%] ${
          isUser
            ? 'bg-indigo-500 text-white rounded-tr-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-md'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} className="text-sm" />
        )}
      </div>
    </div>
  );
}

export function MessageList({ messages, isLoading, className = '' }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Icon name="sparkles" size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">选择文本开始对话</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 p-4 ${className}`}>
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}
      {isLoading && (
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Icon name="bot" size={16} className="text-gray-600 dark:text-gray-400" />
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-2.5">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
