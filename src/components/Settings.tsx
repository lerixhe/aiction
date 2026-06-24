import React, { useState } from 'react';
import { Icon, type IconName } from '../shared/ui/Icon';

type Theme = 'system' | 'dark' | 'light';

interface SettingsProps {
  onBack?: () => void;
}

interface SettingsState {
  theme: Theme;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<string>('appearance');
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'system',
  });

  const handleThemeChange = (theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const sections: Array<{ id: string; label: string; icon: IconName }> = [
    { id: 'appearance', label: '外观', icon: 'palette' },
    { id: 'general', label: '通用', icon: 'settings' },
    { id: 'ai', label: 'AI 设置', icon: 'robot' },
    { id: 'shortcuts', label: '快捷键', icon: 'command' },
    { id: 'about', label: '关于', icon: 'info-circle' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">外观</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">主题</h3>
                <p className="text-text-muted text-sm mb-4">
                  选择应用的外观主题
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      settings.theme === 'system'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-text-muted'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-bg to-bg-card border border-border overflow-hidden">
                        <div className="h-1/2 bg-bg"></div>
                        <div className="h-1/2 bg-white"></div>
                      </div>
                      <span className="font-medium">系统</span>
                    </div>
                    {settings.theme === 'system' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      settings.theme === 'dark'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-text-muted'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-12 rounded-lg bg-bg border border-border"></div>
                      <span className="font-medium">深色</span>
                    </div>
                    {settings.theme === 'dark' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      settings.theme === 'light'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-text-muted'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-12 rounded-lg bg-white border border-gray-200"></div>
                      <span className="font-medium">浅色</span>
                    </div>
                    {settings.theme === 'light' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-3">字体大小</h3>
                <p className="text-text-muted text-sm mb-4">
                  调整应用内的字体显示大小
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-muted">A</span>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    defaultValue="14"
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xl text-text-muted">A</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'general':
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">通用</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-bg rounded-lg">
                <div>
                  <h4 className="font-medium">开机自启</h4>
                  <p className="text-text-muted text-sm">系统启动时自动运行 AIction</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-bg rounded-lg">
                <div>
                  <h4 className="font-medium">显示托盘图标</h4>
                  <p className="text-text-muted text-sm">在系统托盘显示 AIction 图标</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">AI 设置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">API 端点</label>
                <input
                  type="text"
                  placeholder="https://api.openai.com/v1"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">模型</label>
                <select className="w-full">
                  <option>gpt-4o</option>
                  <option>gpt-4o-mini</option>
                  <option>gpt-3.5-turbo</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">快捷键</h2>
            <div className="space-y-3">
              {[
                { action: '触发 AI 动作', shortcut: '⌘ + Shift + A' },
                { action: '打开聊天面板', shortcut: '⌘ + Shift + C' },
                { action: '隐藏/显示窗口', shortcut: '⌘ + Shift + H' },
                { action: '设置', shortcut: '⌘ + ,' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-bg rounded-lg">
                  <span>{item.action}</span>
                  <kbd className="px-3 py-1 bg-bg-card rounded-lg text-sm font-mono border border-border">
                    {item.shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">关于</h2>
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">A</span>
              </div>
              <h3 className="text-xl font-bold mb-2">AIction</h3>
              <p className="text-text-muted mb-1">版本 0.1.0</p>
              <p className="text-text-muted text-sm">
                轻量级 AI + 动作效率工具
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-bg">
      {/* Sidebar */}
      <aside className="w-56 bg-bg-card border-r border-border p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-6 px-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-bg-hover rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-lg">设置</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-primary/20 text-primary'
                  : 'text-text-muted hover:bg-bg-hover hover:text-text'
              }`}
            >
              <Icon name={section.icon} size={20} />
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Settings;
