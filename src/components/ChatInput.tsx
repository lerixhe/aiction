import { useState, useCallback, useRef, type KeyboardEvent } from 'react';
import { Icon } from '~/shared/ui';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSend,
  onStop,
  isLoading,
  disabled,
  placeholder = '输入消息...',
  className = '',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, []);

  return (
    <div
      className={`flex items-end gap-2 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${className}`}
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        rows={1}
        className="flex-1 resize-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100
          placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
          disabled:opacity-50 disabled:cursor-not-allowed
          max-h-[150px]"
      />
      {isLoading ? (
        <button
          onClick={onStop}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
            bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="停止生成"
        >
          <Icon name="loader" size={16} className="animate-spin" />
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
            bg-indigo-500 hover:bg-indigo-600 text-white transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
          title="发送"
        >
          <Icon name="send" size={16} />
        </button>
      )}
    </div>
  );
}
