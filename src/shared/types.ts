import type { ChatMessage } from './events'

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  source: 'manual' | 'selection'
  selectedText?: string
}

export interface ConversationSummary {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  source: 'manual' | 'selection'
  messageCount: number
}

export interface ProviderConfig {
  id: string
  name: string
  apiKey: string
  baseUrl: string
  models: string[]
  defaultModel: string
}

export interface ActionTemplate {
  id: string
  name: string
  icon: string
  prompt: string
  description?: string
  isBuiltIn: boolean
  category?: string
  shortcut?: string
}

export interface UISettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  fontSize: number
  showToolbar: boolean
  toolbarPosition: 'top' | 'bottom' | 'left' | 'right'
  compactMode: boolean
}

export interface AISettings {
  providers: ProviderConfig[]
  defaultProviderId: string
  temperature: number
  maxTokens: number
  streamResponse: boolean
  systemPrompt: string
}

export interface SelectionSettings {
  enabled: boolean
  minLength: number
  maxLength: number
  autoShow: boolean
  delay: number
  excludeApps: string[]
}

export interface ShortcutSettings {
  toggleSelection: string
  openChat: string
  quickAction: string
}

export interface AppSettings {
  version: number
  ai: AISettings
  ui: UISettings
  selection: SelectionSettings
  shortcuts: ShortcutSettings
  actions: ActionTemplate[]
  firstRun: boolean
}

export interface AISettingsUpdate {
  providers?: ProviderConfig[]
  defaultProviderId?: string
  temperature?: number
  maxTokens?: number
  streamResponse?: boolean
  systemPrompt?: string
}

export interface UISettingsUpdate {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  fontSize?: number
  showToolbar?: boolean
  toolbarPosition?: 'top' | 'bottom' | 'left' | 'right'
  compactMode?: boolean
}

export interface SelectionSettingsUpdate {
  enabled?: boolean
  minLength?: number
  maxLength?: number
  autoShow?: boolean
  delay?: number
  excludeApps?: string[]
}

export interface ShortcutSettingsUpdate {
  toggleSelection?: string
  openChat?: string
  quickAction?: string
}

export interface SettingsUpdate {
  ai?: AISettingsUpdate
  ui?: UISettingsUpdate
  selection?: SelectionSettingsUpdate
  shortcuts?: ShortcutSettingsUpdate
  actions?: ActionTemplate[]
  firstRun?: boolean
}
