import { useState, useCallback } from 'react';
import { Icon, useTheme } from '~/shared/ui';
import type { UISettings } from '~/shared/types';

interface AppearanceSettingsProps {
  settings: UISettings;
  onSave: (settings: UISettings) => void;
}

const themes = [
  { value: 'light', label: '浅色', icon: 'sun' as const },
  { value: 'dark', label: '深色', icon: 'moon' as const },
  { value: 'system', label: '跟随系统', icon: 'globe' as const },
];

const positions = [
  { value: 'top', label: '顶部' },
  { value: 'bottom', label: '底部' },
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
];

const fontSizes = [
  { value: 12, label: '小' },
  { value: 14, label: '标准' },
  { value: 16, label: '大' },
  { value: 18, label: '特大' },
];

export function AppearanceSettings({ settings, onSave }: AppearanceSettingsProps) {
  const { setTheme } = useTheme();
  const [uiSettings, setUiSettings] = useState<UISettings>(settings);

  const handleThemeChange = useCallback(
    (theme: 'light' | 'dark' | 'system') => {
      setTheme(theme);
      setUiSettings((prev) => ({ ...prev, theme }));
    },
    [setTheme]
  );

  const handleSave = useCallback(() => {
    onSave(uiSettings);
  }, [uiSettings, onSave]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        外观设置
      </h2>

      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          主题
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => handleThemeChange(value as 'light' | 'dark' | 'system')}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                uiSettings.theme === value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Icon
                name={icon}
                size={24}
                className={
                  uiSettings.theme === value
                    ? 'text-indigo-500'
                    : 'text-gray-500 dark:text-gray-400'
                }
              />
              <span
                className={`text-sm ${
                  uiSettings.theme === value
                    ? 'font-medium text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          工具栏位置
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {positions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setUiSettings((prev) => ({ ...prev, toolbarPosition: value as UISettings['toolbarPosition'] }))}
              className={`py-2 px-3 text-sm rounded-md transition-colors ${
                uiSettings.toolbarPosition === value
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          字体大小
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {fontSizes.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setUiSettings((prev) => ({ ...prev, fontSize: value }))}
              className={`py-2 px-3 text-sm rounded-md transition-colors ${
                uiSettings.fontSize === value
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">显示工具栏</span>
          <button
            onClick={() => setUiSettings((prev) => ({ ...prev, showToolbar: !prev.showToolbar }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              uiSettings.showToolbar
                ? 'bg-indigo-500'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                uiSettings.showToolbar ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">紧凑模式</span>
          <button
            onClick={() => setUiSettings((prev) => ({ ...prev, compactMode: !prev.compactMode }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              uiSettings.compactMode
                ? 'bg-indigo-500'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                uiSettings.compactMode ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </label>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          保存外观设置
        </button>
      </div>
    </div>
  );
}
