import type {
  AppSettings,
  ProviderConfig,
  ActionTemplate,
  UISettings,
  AISettings,
  SelectionSettings,
  ShortcutSettings,
} from './types'

export const DEFAULT_PROVIDER: ProviderConfig = {
  id: 'openai',
  name: 'OpenAI',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  defaultModel: 'gpt-4o-mini',
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  providers: [DEFAULT_PROVIDER],
  defaultProviderId: 'openai',
  temperature: 0.7,
  maxTokens: 4096,
  streamResponse: true,
  systemPrompt: 'You are a helpful AI assistant. Answer concisely and accurately.',
}

export const DEFAULT_UI_SETTINGS: UISettings = {
  theme: 'system',
  language: 'zh-CN',
  fontSize: 14,
  showToolbar: true,
  toolbarPosition: 'bottom',
  compactMode: false,
}

export const DEFAULT_SELECTION_SETTINGS: SelectionSettings = {
  enabled: true,
  minLength: 2,
  maxLength: 10000,
  autoShow: true,
  delay: 300,
  excludeApps: [],
}

export const DEFAULT_SHORTCUT_SETTINGS: ShortcutSettings = {
  toggleSelection: 'CmdOrCtrl+Shift+A',
  openChat: 'CmdOrCtrl+Shift+C',
  quickAction: 'CmdOrCtrl+Shift+Q',
}

export const BUILT_IN_ACTIONS: ActionTemplate[] = [
  {
    id: 'translate',
    name: '翻译',
    icon: 'language',
    prompt: 'Translate the following text to {{target_language}}:\n\n{{selection}}',
    description: '将选中的文本翻译成目标语言',
    isBuiltIn: true,
    category: 'text',
  },
  {
    id: 'summarize',
    name: '总结',
    icon: 'summary',
    prompt: 'Summarize the following text concisely:\n\n{{selection}}',
    description: '对选中的文本进行总结',
    isBuiltIn: true,
    category: 'text',
  },
  {
    id: 'explain',
    name: '解释',
    icon: 'help',
    prompt: 'Explain the following text in simple terms:\n\n{{selection}}',
    description: '用简单的话语解释选中的内容',
    isBuiltIn: true,
    category: 'text',
  },
  {
    id: 'rewrite',
    name: '改写',
    icon: 'edit',
    prompt: 'Rewrite the following text to be clearer and more professional:\n\n{{selection}}',
    description: '改写选中的文本，使其更清晰专业',
    isBuiltIn: true,
    category: 'text',
  },
  {
    id: 'code-explain',
    name: '代码解释',
    icon: 'code',
    prompt: 'Explain the following code in detail:\n\n```\n{{selection}}\n```',
    description: '详细解释选中的代码',
    isBuiltIn: true,
    category: 'code',
  },
  {
    id: 'code-review',
    name: '代码审查',
    icon: 'review',
    prompt: 'Review the following code for potential issues and suggest improvements:\n\n```\n{{selection}}\n```',
    description: '审查代码并提供改进建议',
    isBuiltIn: true,
    category: 'code',
  },
]

export const SETTINGS_VERSION = 1

export const DEFAULT_SETTINGS: AppSettings = {
  version: SETTINGS_VERSION,
  ai: DEFAULT_AI_SETTINGS,
  ui: DEFAULT_UI_SETTINGS,
  selection: DEFAULT_SELECTION_SETTINGS,
  shortcuts: DEFAULT_SHORTCUT_SETTINGS,
  actions: BUILT_IN_ACTIONS,
  firstRun: true,
}
