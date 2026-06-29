import { Icon } from '~/shared/ui';
import type { ConversationSummary } from '~/shared/types';

interface ConversationListProps {
  summaries: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function ConversationList({ summaries, activeId, onSelect, onCreate, onDelete }: ConversationListProps) {
  return (
    <div className="flex flex-col h-full w-[280px] border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Icon name="sparkles" size={18} className="text-indigo-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">AIction</span>
        </div>
        <button
          onClick={onCreate}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200
            dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
          title="新建对话"
        >
          <Icon name="plus" size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {summaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 px-4">
            <Icon name="search" size={32} className="mb-2 opacity-40" />
            <p className="text-xs text-center">暂无对话</p>
            <button
              onClick={onCreate}
              className="mt-3 text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              开始新对话
            </button>
          </div>
        ) : (
          summaries.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`group relative flex items-center px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors ${
                activeId === conv.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {activeId === conv.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {formatTime(conv.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500
                  hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                title="删除对话"
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
        <a
          href="#/settings"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
        >
          <Icon name="settings" size={16} />
          <span>设置</span>
        </a>
      </div>
    </div>
  );
}
