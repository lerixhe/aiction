import { useState, useCallback } from 'react';
import { Icon } from '~/shared/ui';
import type { AISettings, ProviderConfig } from '~/shared/types';
import { testProvider } from '~/api/tauri';

interface ApiConfigProps {
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}

export function ApiConfig({ settings, onSave }: ApiConfigProps) {
  const [providers, setProviders] = useState<ProviderConfig[]>(settings.providers);
  const [defaultProviderId, setDefaultProviderId] = useState(settings.defaultProviderId);
  const [temperature, setTemperature] = useState(settings.temperature);
  const [maxTokens, setMaxTokens] = useState(settings.maxTokens);
  const [streamResponse, setStreamResponse] = useState(settings.streamResponse);
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt);
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});

  const handleProviderChange = useCallback(
    (index: number, field: keyof ProviderConfig, value: string | string[]) => {
      setProviders((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const handleAddProvider = useCallback(() => {
    const newProvider: ProviderConfig = {
      id: `provider-${Date.now()}`,
      name: 'New Provider',
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      models: [],
      defaultModel: 'gpt-4',
    };
    setProviders((prev) => [...prev, newProvider]);
  }, []);

  const handleRemoveProvider = useCallback(
    (index: number) => {
      setProviders((prev) => prev.filter((_, i) => i !== index));
    },
    []
  );

  const handleTestProvider = useCallback(async (providerId: string) => {
    setTestStatus((prev) => ({ ...prev, [providerId]: 'testing' }));
    try {
      const result = await testProvider({ providerId });
      setTestStatus((prev) => ({
        ...prev,
        [providerId]: result.success ? 'success' : 'error',
      }));
      if (result.models && result.models.length > 0) {
        setProviders((prev) =>
          prev.map((p) =>
            p.id === providerId ? { ...p, models: result.models! } : p
          )
        );
      }
    } catch {
      setTestStatus((prev) => ({ ...prev, [providerId]: 'error' }));
    }
    setTimeout(() => {
      setTestStatus((prev) => ({ ...prev, [providerId]: 'idle' }));
    }, 3000);
  }, []);

  const handleSave = useCallback(() => {
    onSave({
      providers,
      defaultProviderId,
      temperature,
      maxTokens,
      streamResponse,
      systemPrompt,
    });
  }, [providers, defaultProviderId, temperature, maxTokens, streamResponse, systemPrompt, onSave]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          AI Provider 配置
        </h2>
        <div className="space-y-4">
          {providers.map((provider, index) => (
            <div
              key={provider.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <input
                  value={provider.name}
                  onChange={(e) => handleProviderChange(index, 'name', e.target.value)}
                  className="text-sm font-medium bg-transparent border-none focus:outline-none
                    text-gray-900 dark:text-gray-100"
                  placeholder="Provider 名称"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestProvider(provider.id)}
                    disabled={testStatus[provider.id] === 'testing'}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      testStatus[provider.id] === 'success'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : testStatus[provider.id] === 'error'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {testStatus[provider.id] === 'testing' ? (
                      <Icon name="loader" size={12} className="animate-spin" />
                    ) : testStatus[provider.id] === 'success' ? (
                      <Icon name="check" size={12} />
                    ) : (
                      '测试'
                    )}
                  </button>
                  <button
                    onClick={() => handleRemoveProvider(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={provider.apiKey}
                    onChange={(e) => handleProviderChange(index, 'apiKey', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                      focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Base URL
                  </label>
                  <input
                    value={provider.baseUrl}
                    onChange={(e) => handleProviderChange(index, 'baseUrl', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                      focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  默认模型
                </label>
                <select
                  value={provider.defaultModel}
                  onChange={(e) => handleProviderChange(index, 'defaultModel', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {provider.models.length > 0 ? (
                    provider.models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))
                  ) : (
                    <option value={provider.defaultModel}>{provider.defaultModel}</option>
                  )}
                </select>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddProvider}
            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg
              text-gray-500 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors
              flex items-center justify-center gap-2"
          >
            <Icon name="plus" size={16} />
            <span className="text-sm">添加 Provider</span>
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          默认 Provider
        </h3>
        <select
          value={defaultProviderId}
          onChange={(e) => setDefaultProviderId(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          模型参数
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Temperature ({temperature.toFixed(1)})
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Max Tokens
            </label>
            <input
              type="number"
              min={1}
              max={128000}
              value={maxTokens}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= 128000) {
                  setMaxTokens(val);
                }
              }}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={streamResponse}
            onChange={(e) => setStreamResponse(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">流式响应</span>
        </label>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            系统提示词
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            placeholder="输入系统提示词..."
          />
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          保存配置
        </button>
      </div>
    </div>
  );
}
