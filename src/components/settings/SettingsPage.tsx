import { useState, useCallback, useEffect } from 'react';
import { Icon } from '~/shared/ui';
import { ApiConfig } from './ApiConfig';
import { ActionsEditor } from './ActionsEditor';
import { AppearanceSettings } from './AppearanceSettings';
import { getSettings, updateSettings } from '~/api/tauri';
import type { AppSettings, SettingsUpdate } from '~/shared/types';

type SettingsTab = 'api' | 'actions' | 'appearance';

const tabs: { id: SettingsTab; label: string; icon: 'settings' | 'sparkles' | 'sun' }[] = [
  { id: 'api', label: 'API 配置', icon: 'settings' },
  { id: 'actions', label: '动作管理', icon: 'sparkles' },
  { id: 'appearance', label: '外观设置', icon: 'sun' },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('api');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const loaded = await getSettings();
      setSettings(loaded);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSave = useCallback(async (update: SettingsUpdate) => {
    try {
      setSaveStatus('saving');
      const updated = await updateSettings(update);
      setSettings(updated);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <Icon name="loader" size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500 dark:text-gray-400">加载设置失败</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">设置</h1>
          {saveStatus !== 'idle' && (
            <div
              className={`flex items-center gap-2 text-sm ${
                saveStatus === 'saving'
                  ? 'text-gray-500'
                  : saveStatus === 'saved'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {saveStatus === 'saving' && <Icon name="loader" size={14} className="animate-spin" />}
              {saveStatus === 'saved' && <Icon name="check" size={14} />}
              {saveStatus === 'error' && <Icon name="alert-circle" size={14} />}
              <span>
                {saveStatus === 'saving'
                  ? '保存中...'
                  : saveStatus === 'saved'
                  ? '已保存'
                  : '保存失败'}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === 'api' && (
            <ApiConfig settings={settings.ai} onSave={(ai) => handleSave({ ai })} />
          )}
          {activeTab === 'actions' && (
            <ActionsEditor
              actions={settings.actions}
              onSave={(actions) => handleSave({ actions })}
            />
          )}
          {activeTab === 'appearance' && (
            <AppearanceSettings settings={settings.ui} onSave={(ui) => handleSave({ ui })} />
          )}
        </div>
      </div>
    </div>
  );
}
