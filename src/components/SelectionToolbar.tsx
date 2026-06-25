import { useState, useCallback, useEffect, useRef } from 'react';
import { Icon } from '~/shared/ui';
import { ToolbarActionMenu, type ActionItem } from './ToolbarActionMenu';

interface SelectionToolbarProps {
  selectedText: string;
  position?: { x: number; y: number };
  actions?: ActionItem[];
  onActionClick?: (actionId: string, selectedText: string) => void;
  onOpenChat?: (selectedText: string) => void;
  onCopy?: (text: string) => void;
  onClose?: () => void;
  className?: string;
}

const DEFAULT_ACTIONS: ActionItem[] = [
  { id: 'translate', name: '翻译', icon: 'translate' },
  { id: 'explain', name: '解释', icon: 'sparkles' },
  { id: 'summarize', name: '总结', icon: 'edit' },
];

export function SelectionToolbar({
  selectedText,
  position,
  actions = DEFAULT_ACTIONS,
  onActionClick,
  onOpenChat,
  onCopy,
  onClose,
  className = '',
}: SelectionToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (selectedText) {
      setIsVisible(true);
      setCopied(false);
    } else {
      setIsVisible(false);
    }
  }, [selectedText]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      onCopy?.(selectedText);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [selectedText, onCopy]);

  const handleActionClick = useCallback(
    (actionId: string) => {
      onActionClick?.(actionId, selectedText);
    },
    [onActionClick, selectedText]
  );

  const handleOpenChat = useCallback(() => {
    onOpenChat?.(selectedText);
  }, [onOpenChat, selectedText]);

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className={`
        fixed z-[9999] flex items-center gap-1 p-1.5
        bg-white dark:bg-gray-800
        rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
        animate-in fade-in slide-in-from-bottom-2 duration-200
        ${className}
      `}
      style={
        position
          ? { left: position.x, top: position.y }
          : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
      }
    >
      <ToolbarActionMenu
        actions={actions}
        onActionClick={handleActionClick}
      />

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

      <button
        onClick={handleOpenChat}
        className="flex items-center justify-center w-8 h-8 rounded-md
          text-gray-600 hover:text-gray-900 hover:bg-gray-100
          dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700
          transition-colors duration-150"
        aria-label="打开对话"
      >
        <Icon name="send" size={16} />
      </button>

      <button
        onClick={handleCopy}
        className="flex items-center justify-center w-8 h-8 rounded-md
          text-gray-600 hover:text-gray-900 hover:bg-gray-100
          dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700
          transition-colors duration-150"
        aria-label={copied ? '已复制' : '复制文本'}
      >
        <Icon name={copied ? 'copy-check' : 'copy'} size={16} />
      </button>

      {onClose && (
        <>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-md
              text-gray-400 hover:text-gray-600 hover:bg-gray-100
              dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700
              transition-colors duration-150"
            aria-label="关闭"
          >
            <Icon name="x" size={14} />
          </button>
        </>
      )}
    </div>
  );
}
