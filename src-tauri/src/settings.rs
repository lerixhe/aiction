use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderConfig {
    pub id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub api_key: Option<String>,
    pub base_url: String,
    pub models: Vec<String>,
    pub default_model: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionTemplate {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub prompt: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub is_built_in: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shortcut: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UISettings {
    pub theme: String,
    pub language: String,
    pub font_size: u32,
    pub show_toolbar: bool,
    pub toolbar_position: String,
    pub compact_mode: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AISettings {
    pub providers: Vec<ProviderConfig>,
    pub default_provider_id: String,
    pub temperature: f64,
    pub max_tokens: u32,
    pub stream_response: bool,
    pub system_prompt: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SelectionSettings {
    pub enabled: bool,
    pub min_length: u32,
    pub max_length: u32,
    pub auto_show: bool,
    pub delay: u32,
    pub exclude_apps: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShortcutSettings {
    pub toggle_selection: String,
    pub open_chat: String,
    pub quick_action: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub version: u32,
    pub ai: AISettings,
    pub ui: UISettings,
    pub selection: SelectionSettings,
    pub shortcuts: ShortcutSettings,
    pub actions: Vec<ActionTemplate>,
    pub first_run: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SettingsUpdate {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ai: Option<AISettingsUpdate>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ui: Option<UISettingsUpdate>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub selection: Option<SelectionSettingsUpdate>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shortcuts: Option<ShortcutSettingsUpdate>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actions: Option<Vec<ActionTemplate>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub first_run: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AISettingsUpdate {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub providers: Option<Vec<ProviderConfig>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_provider_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream_response: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system_prompt: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UISettingsUpdate {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub theme: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub language: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub font_size: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub show_toolbar: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub toolbar_position: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub compact_mode: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SelectionSettingsUpdate {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min_length: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_length: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auto_show: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub delay: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exclude_apps: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShortcutSettingsUpdate {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub toggle_selection: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub open_chat: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub quick_action: Option<String>,
}

impl Default for ProviderConfig {
    fn default() -> Self {
        Self {
            id: "openai".to_string(),
            name: "OpenAI".to_string(),
            api_key: None,
            base_url: "https://api.openai.com/v1".to_string(),
            models: vec![
                "gpt-4o".to_string(),
                "gpt-4o-mini".to_string(),
                "gpt-4-turbo".to_string(),
                "gpt-3.5-turbo".to_string(),
            ],
            default_model: "gpt-4o-mini".to_string(),
        }
    }
}

impl Default for UISettings {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            language: "zh-CN".to_string(),
            font_size: 14,
            show_toolbar: true,
            toolbar_position: "bottom".to_string(),
            compact_mode: false,
        }
    }
}

impl Default for AISettings {
    fn default() -> Self {
        Self {
            providers: vec![ProviderConfig::default()],
            default_provider_id: "openai".to_string(),
            temperature: 0.7,
            max_tokens: 4096,
            stream_response: true,
            system_prompt: "You are a helpful AI assistant. Answer concisely and accurately.".to_string(),
        }
    }
}

impl Default for SelectionSettings {
    fn default() -> Self {
        Self {
            enabled: true,
            min_length: 2,
            max_length: 10000,
            auto_show: true,
            delay: 300,
            exclude_apps: Vec::new(),
        }
    }
}

impl Default for ShortcutSettings {
    fn default() -> Self {
        Self {
            toggle_selection: "CmdOrCtrl+Shift+A".to_string(),
            open_chat: "CmdOrCtrl+Shift+C".to_string(),
            quick_action: "CmdOrCtrl+Shift+Q".to_string(),
        }
    }
}

fn default_actions() -> Vec<ActionTemplate> {
    vec![
        ActionTemplate {
            id: "translate".to_string(),
            name: "翻译".to_string(),
            icon: "language".to_string(),
            prompt: "Translate the following text to {{target_language}}:\n\n{{selection}}".to_string(),
            description: Some("将选中的文本翻译成目标语言".to_string()),
            is_built_in: true,
            category: Some("text".to_string()),
            shortcut: None,
        },
        ActionTemplate {
            id: "summarize".to_string(),
            name: "总结".to_string(),
            icon: "summary".to_string(),
            prompt: "Summarize the following text concisely:\n\n{{selection}}".to_string(),
            description: Some("对选中的文本进行总结".to_string()),
            is_built_in: true,
            category: Some("text".to_string()),
            shortcut: None,
        },
        ActionTemplate {
            id: "explain".to_string(),
            name: "解释".to_string(),
            icon: "help".to_string(),
            prompt: "Explain the following text in simple terms:\n\n{{selection}}".to_string(),
            description: Some("用简单的话语解释选中的内容".to_string()),
            is_built_in: true,
            category: Some("text".to_string()),
            shortcut: None,
        },
        ActionTemplate {
            id: "rewrite".to_string(),
            name: "改写".to_string(),
            icon: "edit".to_string(),
            prompt: "Rewrite the following text to be clearer and more professional:\n\n{{selection}}".to_string(),
            description: Some("改写选中的文本，使其更清晰专业".to_string()),
            is_built_in: true,
            category: Some("text".to_string()),
            shortcut: None,
        },
        ActionTemplate {
            id: "code-explain".to_string(),
            name: "代码解释".to_string(),
            icon: "code".to_string(),
            prompt: "Explain the following code in detail:\n\n```\n{{selection}}\n```".to_string(),
            description: Some("详细解释选中的代码".to_string()),
            is_built_in: true,
            category: Some("code".to_string()),
            shortcut: None,
        },
        ActionTemplate {
            id: "code-review".to_string(),
            name: "代码审查".to_string(),
            icon: "review".to_string(),
            prompt: "Review the following code for potential issues and suggest improvements:\n\n```\n{{selection}}\n```".to_string(),
            description: Some("审查代码并提供改进建议".to_string()),
            is_built_in: true,
            category: Some("code".to_string()),
            shortcut: None,
        },
    ]
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            version: 1,
            ai: AISettings::default(),
            ui: UISettings::default(),
            selection: SelectionSettings::default(),
            shortcuts: ShortcutSettings::default(),
            actions: default_actions(),
            first_run: true,
        }
    }
}

impl AppSettings {
    pub fn merge_update(&mut self, update: SettingsUpdate) {
        if let Some(ai_update) = update.ai {
            if let Some(providers) = ai_update.providers {
                self.ai.providers = providers;
            }
            if let Some(id) = ai_update.default_provider_id {
                self.ai.default_provider_id = id;
            }
            if let Some(temp) = ai_update.temperature {
                self.ai.temperature = temp;
            }
            if let Some(tokens) = ai_update.max_tokens {
                self.ai.max_tokens = tokens;
            }
            if let Some(stream) = ai_update.stream_response {
                self.ai.stream_response = stream;
            }
            if let Some(prompt) = ai_update.system_prompt {
                self.ai.system_prompt = prompt;
            }
        }

        if let Some(ui_update) = update.ui {
            if let Some(theme) = ui_update.theme {
                self.ui.theme = theme;
            }
            if let Some(lang) = ui_update.language {
                self.ui.language = lang;
            }
            if let Some(size) = ui_update.font_size {
                self.ui.font_size = size;
            }
            if let Some(show) = ui_update.show_toolbar {
                self.ui.show_toolbar = show;
            }
            if let Some(pos) = ui_update.toolbar_position {
                self.ui.toolbar_position = pos;
            }
            if let Some(compact) = ui_update.compact_mode {
                self.ui.compact_mode = compact;
            }
        }

        if let Some(sel_update) = update.selection {
            if let Some(enabled) = sel_update.enabled {
                self.selection.enabled = enabled;
            }
            if let Some(min) = sel_update.min_length {
                self.selection.min_length = min;
            }
            if let Some(max) = sel_update.max_length {
                self.selection.max_length = max;
            }
            if let Some(auto) = sel_update.auto_show {
                self.selection.auto_show = auto;
            }
            if let Some(delay) = sel_update.delay {
                self.selection.delay = delay;
            }
            if let Some(exclude) = sel_update.exclude_apps {
                self.selection.exclude_apps = exclude;
            }
        }

        if let Some(shortcut_update) = update.shortcuts {
            if let Some(toggle) = shortcut_update.toggle_selection {
                self.shortcuts.toggle_selection = toggle;
            }
            if let Some(open) = shortcut_update.open_chat {
                self.shortcuts.open_chat = open;
            }
            if let Some(quick) = shortcut_update.quick_action {
                self.shortcuts.quick_action = quick;
            }
        }

        if let Some(actions) = update.actions {
            self.actions = actions;
        }

        if let Some(first_run) = update.first_run {
            self.first_run = first_run;
        }
    }

    pub fn sanitize(&mut self) {
        if self.version == 0 {
            self.version = 1;
        }

        if self.ai.providers.is_empty() {
            self.ai.providers = vec![ProviderConfig::default()];
        }

        if self.ai.default_provider_id.is_empty() {
            self.ai.default_provider_id = self.ai.providers[0].id.clone();
        }

        let provider_exists = self.ai.providers.iter().any(|p| p.id == self.ai.default_provider_id);
        if !provider_exists {
            self.ai.default_provider_id = self.ai.providers[0].id.clone();
        }

        if self.ai.temperature < 0.0 || self.ai.temperature > 2.0 {
            self.ai.temperature = 0.7;
        }

        if self.ai.max_tokens == 0 {
            self.ai.max_tokens = 4096;
        }

        if self.ui.font_size < 10 || self.ui.font_size > 32 {
            self.ui.font_size = 14;
        }

        if !["system", "light", "dark"].contains(&self.ui.theme.as_str()) {
            self.ui.theme = "system".to_string();
        }

        if !["top", "bottom", "left", "right"].contains(&self.ui.toolbar_position.as_str()) {
            self.ui.toolbar_position = "bottom".to_string();
        }

        if self.selection.min_length == 0 {
            self.selection.min_length = 2;
        }

        if self.selection.max_length < self.selection.min_length {
            self.selection.max_length = 10000;
        }

        if self.actions.is_empty() {
            self.actions = default_actions();
        }

        for built_in in default_actions() {
            if !self.actions.iter().any(|a| a.id == built_in.id) {
                self.actions.push(built_in);
            }
        }
    }
}
