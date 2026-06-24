use std::sync::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiConfig {
    pub api_key: Option<String>,
    pub api_base_url: Option<String>,
    pub model: Option<String>,
}

impl Default for AiConfig {
    fn default() -> Self {
        Self {
            api_key: None,
            api_base_url: Some("https://api.openai.com/v1".to_string()),
            model: Some("gpt-4".to_string()),
        }
    }
}

pub struct AppState {
    pub ai_config: Mutex<AiConfig>,
    pub clipboard_monitor_active: Mutex<bool>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            ai_config: Mutex::new(AiConfig::default()),
            clipboard_monitor_active: Mutex::new(false),
        }
    }
}
