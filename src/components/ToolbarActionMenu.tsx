import { useState } from 'react';
import { Icon, type IconName } from '~/shared/ui';

export interface ActionItem {
  id: string;
  name: string;
  icon: IconName;
  description?: string;
  shortcut?: string;
}

interface ToolbarActionMenuProps {
  actions: ActionItem[];
  onActionClick: (actionId: string) => void;
  className?: string;
}

export function ToolbarActionMenu({
  actions,
  onActionClick,
  className = '',
}: ToolbarActionMenuProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onActionClick(action.id)}
          onMouseEnter={() => setHoveredId(action.id)}
          onMouseLeave={() => setHoveredId(null)}
          className="relative flex items-center justify-center w-8 h-8 rounded-md
            text-gray-600 hover:text-gray-900 hover:bg-gray-100
            dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700
            transition-colors duration-150"
          title={action.name}
        >
          <Icon name={action.icon} size={16} />
          {hoveredId === action.id && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1
              bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded
              whitespace-nowrap pointer-events-none z-50">
              {action.name}
              {action.shortcut && (
                <span className="ml-2 opacity-60">{action.shortcut}</span>
              )}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1
                border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
