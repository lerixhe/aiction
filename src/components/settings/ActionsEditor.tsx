import { useState, useCallback } from 'react';
import { Icon, type IconName } from '~/shared/ui';
import type { ActionTemplate } from '~/shared/types';

interface ActionsEditorProps {
  actions: ActionTemplate[];
  onSave: (actions: ActionTemplate[]) => void;
}

const AVAILABLE_ICONS: IconName[] = [
  'sparkles', 'translate', 'edit', 'copy', 'search', 'wand',
  'send', 'refresh', 'globe', 'user', 'bot', 'keyboard',
];

export function ActionsEditor({ actions, onSave }: ActionsEditorProps) {
  const [editActions, setEditActions] = useState<ActionTemplate[]>(actions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState<string | null>(null);

  const handleAddAction = useCallback(() => {
    const newAction: ActionTemplate = {
      id: `action-${Date.now()}`,
      name: '新动作',
      icon: 'sparkles',
      prompt: '',
      description: '',
      isBuiltIn: false,
      category: 'custom',
    };
    setEditActions((prev) => [...prev, newAction]);
    setEditingId(newAction.id);
  }, []);

  const handleRemoveAction = useCallback((id: string) => {
    setEditActions((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) setEditingId(null);
  }, [editingId]);

  const handleUpdateAction = useCallback(
    (id: string, field: keyof ActionTemplate, value: string | boolean) => {
      setEditActions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
      );
    },
    []
  );

  const handleIconSelect = useCallback((icon: IconName) => {
    if (iconPickerTarget) {
      handleUpdateAction(iconPickerTarget, 'icon', icon);
    }
    setShowIconPicker(false);
    setIconPickerTarget(null);
  }, [iconPickerTarget, handleUpdateAction]);

  const handleSave = useCallback(() => {
    onSave(editActions);
  }, [editActions, onSave]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          动作管理
        </h2>
        <button
          onClick={handleAddAction}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 text-white rounded-lg
            hover:bg-indigo-600 transition-colors text-sm"
        >
          <Icon name="plus" size={14} />
          添加动作
        </button>
      </div>

      <div className="space-y-3">
        {editActions.map((action) => (
          <div
            key={action.id}
            className={`p-4 border rounded-lg transition-colors ${
              editingId === action.id
                ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {editingId === action.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIconPickerTarget(action.id);
                      setShowIconPicker(true);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-lg
                      border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                      hover:border-indigo-500 transition-colors"
                  >
                    <Icon name={action.icon as IconName} size={20} />
                  </button>
                  <input
                    value={action.name}
                    onChange={(e) => handleUpdateAction(action.id, 'name', e.target.value)}
                    className="flex-1 text-sm font-medium bg-transparent border-none focus:outline-none
                      text-gray-900 dark:text-gray-100"
                    placeholder="动作名称"
                  />
                </div>

                <input
                  value={action.description || ''}
                  onChange={(e) => handleUpdateAction(action.id, 'description', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="动作描述（可选）"
                />

                <textarea
                  value={action.prompt}
                  onChange={(e) => handleUpdateAction(action.id, 'prompt', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="输入提示词模板..."
                />

                <div className="flex items-center gap-2">
                  <input
                    value={action.shortcut || ''}
                    onChange={(e) => handleUpdateAction(action.id, 'shortcut', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                      focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="快捷键（可选）"
                  />
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-md
                      hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    完成
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg
                    bg-gray-100 dark:bg-gray-800">
                    <Icon name={action.icon as IconName} size={20}
                      className="text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {action.name}
                    </p>
                    {action.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {action.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {action.shortcut && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                      {action.shortcut}
                    </span>
                  )}
                  <button
                    onClick={() => setEditingId(action.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <Icon name="edit" size={14} />
                  </button>
                  {!action.isBuiltIn && (
                    <button
                      onClick={() => handleRemoveAction(action.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showIconPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-4 max-w-xs w-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                选择图标
              </h3>
              <button
                onClick={() => setShowIconPicker(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => handleIconSelect(icon)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon name={icon} size={20} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          保存动作
        </button>
      </div>
    </div>
  );
}
